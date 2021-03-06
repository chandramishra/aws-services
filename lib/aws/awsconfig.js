
var inherits = require('util').inherits;
var FlowController = require('../flow_controller');
var AWS = require('aws-sdk');

function AWSConfig() {

  FlowController.call(this);

  var me = this;

  me.findService = function(input) {
    var params = {region:input.region};
    if (input.creds)  params.credentials = input.creds;
    else if (input.profile) {
      var credentials = new AWS.SharedIniFileCredentials({profile: input.profile});
      AWS.config.credentials = credentials;
    }
    var configService = new AWS.ConfigService(params);
    return configService;
  }

  me.findRecorders = function(input, callback) {

    params = {}
    //if (input.configRecorderName)  params.ConfigurationRecorderNames = [input.configRecorderName];
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.describeConfigurationRecorders(params, callback);
      return;
    }

    self.callbackFind = function(data) {
      if (data.ConfigurationRecorders[0]) {
        console.log('found recorder(s)');
        return data.ConfigurationRecorders[0];
      }
      else {
        console.log("no recorder(s) found");
        return null;
       }
    }

    self.addParams = function(found) {
      self.params.configRecorderName = found.name;
    }

    var configService = me.preRun(self, input);
    configService.describeConfigurationRecorders(params, me.callbackFind);
  }
  // { ConfigurationRecorders:
  //     [ { name: 'default',
  //         recordingGroup: [Object],
  //         roleARN: 'arn:aws:iam::290093585298:role/lambda_config_setup_role' } ] }

  me.setRoleInRecorder = function(input, callback) {

    params = {
      ConfigurationRecorder: {
        name: input.configRecorderName,
        /*recordingGroup: {
          allSupported: true,
          resourceTypes: []
        },*/
        roleARN: input.roleArn
      }
    };
    //console.log(params);
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.putConfigurationRecorder(params, callback);
      return;
    }

    var configService = me.preRun(self, input);
    configService.putConfigurationRecorder(params, me.callback);
  }

  me.findChannels = function(input, callback) {

    params = {}
    //if (input.deliveryChannelName)  params.DeliveryChannelNames = [input.deliveryChannelName];
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.describeDeliveryChannels(params, callback);
      return;
    }

    self.callbackFind = function(data) {
      if (data.DeliveryChannels[0]) {
        console.log('successfully found channel(s)');
        return data.DeliveryChannels[0];
      }
      else {
        console.log("no channel(s) found");
        return null;
       }
    }

    self.addParams = function(found) {
      self.params.deliveryChannelName = found.name;
    }

    var configService = me.preRun(self, input);
    configService.describeDeliveryChannels(params, me.callbackFind);
  }
  // { DeliveryChannels:
  //     [ { name: 'default',
  //         s3BucketName: '290093585298.awsconfig',
  //         snsTopicARN: 'arn:aws:sns:us-west-2:290093585298:config-topic-temp' } ] }

  me.setChannel = function(input, callback) {

    params = {
      DeliveryChannel: {
        name: input.deliveryChannelName,
        s3BucketName: input.bucketName,
        s3KeyPrefix: null,
        snsTopicARN: input.topicArn
      }
    };
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.putDeliveryChannel(params, callback);
      return;
    }

    var configService = me.preRun(self, input);
    configService.putDeliveryChannel(params, me.callback);
  }
  // {}

  me.findRecordersStatus = function(input, callback) {

    params = {}
    if (input.configRecorderName)  params.ConfigurationRecorderNames = [input.configRecorderName];
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.describeConfigurationRecorderStatus(params, callback);
      return;
    }

    self.callbackFind = function(data) {
      if (data.ConfigurationRecordersStatus[0]) {
        if (data.ConfigurationRecordersStatus[0].recording) {
          console.log('recording is currently on');
          return data.ConfigurationRecordersStatus[0];
        }
        else {
          console.log('recording is currently off');
          return null;
        }
      }
      else {
        console.log("No recorder status found in describeConfigurationRecorderStatus");
        return null;
      }
    }

    self.addParams = function(found) {
      self.params.configRecorderName = found.name;
    }

    var configService = me.preRun(self, input);
    configService.describeConfigurationRecorderStatus(params, me.callbackFind);
  }
  // { ConfigurationRecordersStatus:
  //     [ { lastStartTime: Mon Jul 13 2015 16:00:30 GMT-0400 (EDT),
  //         lastStatus: 'SUCCESS',
  //         lastStatusChangeTime: Fri Jul 17 2015 16:00:45 GMT-0400 (EDT),
  //         lastStopTime: Fri Jul 17 2015 17:25:14 GMT-0400 (EDT),
  //         name: 'default',
  //         recording: false } ] }


  // The channels must be created first. We'll get below error if there is no channel.
  // 'NoAvailableDeliveryChannelException: Delivery channel is not available to start configuration recorder.
  me.startRecorder = function(input, callback) {

    params = {
      ConfigurationRecorderName: input.configRecorderName
    };
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.startConfigurationRecorder(params, callback);
      return;
    }

    var configService = me.preRun(self, input);
    configService.startConfigurationRecorder(params, me.callback);
  }
  // {}

  me.findChannelsStatus = function(input, callback) {

    params = {}
    if (input.deliveryChannelName)  params.DeliveryChannelNames = [input.deliveryChannelName];
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.describeDeliveryChannelStatus(params, callback);
      return;
    }

    self.callbackFind = function(data) {
      if (data.DeliveryChannelsStatus[0]) {
        console.log('channel status is found');
        return data.DeliveryChannelsStatus[0];
      }
      else {
        console.log('channel status is not found');
        return null;
      }
    }

    self.addParams = function(found) {
      self.params.deliveryChannelName = found.name;
    }

    var configService = me.preRun(self, input);
    configService.describeDeliveryChannelStatus(params, me.callbackFind);
    // { DeliveryChannelsStatus:
    //     [ { configHistoryDeliveryInfo: {},
    //         configSnapshotDeliveryInfo: {},
    //         configStreamDeliveryInfo: {},
    //         name: 'default' } ] }
  }

  me.stopRecorder = function(input, callback) {

    params = {
      ConfigurationRecorderName: input.configRecorderName
    };
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.stopConfigurationRecorder(params, callback);
      return;
    }

    var configService = me.preRun(self, input);
    configService.stopConfigurationRecorder(params, me.callback);
  }
  // {}

  me.deleteChannel = function(input, callback) {

    var params = {
      DeliveryChannelName: input.deliveryChannelName
    };
    var self = arguments.callee;

    if (callback) {
      var configService = me.findService(input);
      configService.deleteDeliveryChannel(params, callback);
      return;
    }

    var configService = me.preRun(self, input);
    configService.deleteDeliveryChannel(params, me.callback);
  }
  // {}
}

module.exports = AWSConfig
