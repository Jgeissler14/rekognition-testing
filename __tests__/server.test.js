const request = require('supertest');

// Mock AWS Rekognition client
jest.mock('aws-sdk', () => {
  const mockIndexFaces = jest.fn().mockReturnValue({ promise: () => Promise.resolve({ FaceRecords: [{ Face: { FaceId: 'id1' } }] }) });
  const mockSearchFacesByImage = jest.fn().mockReturnValue({ promise: () => Promise.resolve({ FaceMatches: [{ Face: { ExternalImageId: '123' }, Similarity: 99.9 }] }) });
  const mockDescribeCollection = jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) });
  return {
    Rekognition: jest.fn(() => ({
      indexFaces: mockIndexFaces,
      searchFacesByImage: mockSearchFacesByImage,
      describeCollection: mockDescribeCollection,
      createCollection: jest.fn().mockReturnValue({ promise: () => Promise.resolve({}) })
    }))
  };
});

const { app, ensureCollection } = require('../server');
const AWS = require('aws-sdk');

describe('API endpoints', () => {
  beforeAll(async () => {
    // mock ensureCollection to not interact with AWS during tests
    AWS.Rekognition.mockClear();
    await ensureCollection();
  });

  test('POST /index requires parameters', async () => {
    const res = await request(app).post('/index').send({});
    expect(res.status).toBe(400);
  });

  test('POST /identify requires image', async () => {
    const res = await request(app).post('/identify').send({});
    expect(res.status).toBe(400);
  });

  test('successful face indexing and identification', async () => {
    const indexRes = await request(app).post('/index').send({
      studentId: '123',
      image: Buffer.from('fake').toString('base64'),
    });
    expect(indexRes.status).toBe(200);
    expect(Array.isArray(indexRes.body.faceIds)).toBe(true);

    const idRes = await request(app).post('/identify').send({
      image: Buffer.from('fake').toString('base64'),
    });
    expect(idRes.status).toBe(200);
    expect(Array.isArray(idRes.body.students)).toBe(true);
  });
});
