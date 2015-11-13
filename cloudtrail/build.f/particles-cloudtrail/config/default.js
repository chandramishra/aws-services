var config = {
  s3: [
    {
      aws: {
        region: 'us-east-1',
        bucket: 'particles-cloudtrail.us-east-1'
      },
      clean: true,
      validate: true,
      create: true
    }
  ],
  dist: 'dist'
};

module.exports = config;
