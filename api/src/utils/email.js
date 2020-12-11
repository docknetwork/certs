import AWS from 'aws-sdk';

// The AWS Region that you want to use to send the email. For a list of
// AWS Regions where the Amazon Pinpoint API is available, see
// https://docs.aws.amazon.com/pinpoint/latest/apireference/
const region = 'us-west-2';

// The "From" address. This address has to be verified in Amazon Pinpoint
// in the region that you use to send email.
const senderAddress = 'marketing@dock.io';

// The Amazon Pinpoint project/application ID to use when you send this message.
// Make sure that the SMS channel is enabled for the project or application
// that you choose.
const appId = '74e0539b9d174cef9fa4b2384dae7f06';

// Specify that you're using a shared credentials file.
const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;

// Specify the region.
AWS.config.update({ region });

// Create a new Pinpoint object.
const pinpoint = new AWS.Pinpoint();

export default function sendEmail(email, recipientName, recipientRef, issuerName) {
  // Build parameters for pinpoint email
  const params = {
    ApplicationId: appId,
    MessageRequest: {
      Addresses: {
        [email]: {
          ChannelType: 'EMAIL',
          Substitutions: {
            RecipientName: [
              recipientName,
            ],
            IssuerName: [
              issuerName,
            ],
            RecipientRef: [
              recipientRef,
            ],
          },
        },
      },
      TemplateConfiguration: {
        EmailTemplate: {
          Name: 'cert-issued',
        },
      },
      MessageConfiguration: {
        EmailMessage: {
          FromAddress: senderAddress,
        },
      },
    },
  };

  // Try to send the email.
  pinpoint.sendMessages(params);
}
