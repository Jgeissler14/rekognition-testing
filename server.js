const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();
const port = process.env.PORT || 3000;
const COLLECTION_ID = process.env.COLLECTION_ID || 'students';
const rekognition = new AWS.Rekognition({ region: process.env.AWS_REGION || 'us-east-1' });

app.use(bodyParser.json({ limit: '10mb' }));

async function ensureCollection() {
  try {
    await rekognition.describeCollection({ CollectionId: COLLECTION_ID }).promise();
  } catch (err) {
    if (err.code === 'ResourceNotFoundException') {
      await rekognition.createCollection({ CollectionId: COLLECTION_ID }).promise();
    } else {
      throw err;
    }
  }
}

app.post('/index', async (req, res) => {
  const { studentId, image } = req.body;
  if (!studentId || !image) {
    return res.status(400).json({ error: 'studentId and image are required' });
  }
  try {
    const params = {
      CollectionId: COLLECTION_ID,
      Image: { Bytes: Buffer.from(image, 'base64') },
      ExternalImageId: studentId,
      DetectionAttributes: [],
    };
    const data = await rekognition.indexFaces(params).promise();
    res.json({ faceIds: data.FaceRecords.map(r => r.Face.FaceId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/identify', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'image is required' });
  }
  try {
    const params = {
      CollectionId: COLLECTION_ID,
      Image: { Bytes: Buffer.from(image, 'base64') },
      FaceMatchThreshold: 90,
      MaxFaces: 50,
    };
    const data = await rekognition.searchFacesByImage(params).promise();
    const students = data.FaceMatches.map(m => ({
      studentId: m.Face.ExternalImageId,
      similarity: m.Similarity,
    }));
    res.json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  ensureCollection().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }).catch(err => {
    console.error('Failed to initialize Rekognition collection:', err);
    process.exit(1);
  });
}

module.exports = { app, ensureCollection };
