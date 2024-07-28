// pages/api/detect-device.js
import DeviceDetector from 'node-device-detector';

export default function handler(req, res) {
  const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
    deviceTrusted: false,
    deviceInfo: false,
    maxUserAgentSize: 500,
  });

  const userAgent = req.headers['user-agent'] || '';
  const result = detector.detect(userAgent);

  // Generate a unique key
  const uniqueKey = `${result.device?.name || 'unknown'}-${result.os?.name || 'unknown'}-${result.client?.name || 'unknown'}-${result.device?.model || 'unknown'}`;

  res.status(200).json({ ...result, uniqueKey });
}
