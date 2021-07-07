require('dotenv').config();

import AWS from 'aws-sdk';

// The AWS Region that you want to use to send the email. For a list of
// AWS Regions where the Amazon Pinpoint API is available, see
// https://docs.aws.amazon.com/pinpoint/latest/apireference/
const region = process.env.AWS_PINPOINT_REGION;

// The "From" address. This address has to be verified in Amazon Pinpoint
// in the region that you use to send email.
const senderAddress = process.env.AWS_PINPOINT_SENDER;

// The Amazon Pinpoint project/application ID to use when you send this message.
// Make sure that the SMS channel is enabled for the project or application
// that you choose.
const appId = process.env.AWS_PINPOINT_APP_ID;

// Specify that you're using a shared credentials file.
const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;

// Specify the region.
AWS.config.update({ region });

// Create a new Pinpoint object.
const pinpoint = new AWS.Pinpoint();

export function sendEmailWithContent(email, subject, content) {
  if (!appId) {
    return;
  }

  // Build parameters for pinpoint email
  const charset = 'UTF-8';
  const params = {
    ApplicationId: appId,
    MessageRequest: {
      Addresses: {
        [email]: {
          ChannelType: 'EMAIL',
        },
      },
      MessageConfiguration: {
        EmailMessage: {
          FromAddress: senderAddress,
          SimpleEmail: {
            Subject: {
              Charset: charset,
              Data: subject
            },
            HtmlPart: {
              Charset: charset,
              Data: content
            },
            TextPart: {
              Charset: charset,
              Data: content
            }
          }
        }
      }
    },
  };

  // Try to send the email.
  pinpoint.sendMessages(params, function(err, data) {
    // If something goes wrong, print an error message.
    if(err) {
      console.error(err.message);
    } else {
      console.log('Email sent! Message ID:', data.MessageId);
    }
  });
}

export default function sendEmail(email, recipientName, recipientRef, issuerName, templateName = 'cert-issued') {
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
          Name: templateName,
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
  pinpoint.sendMessages(params, function(err, data) {
    // If something goes wrong, print an error message.
    if(err) {
      console.error(err.message);
    } else {
      console.log('Email sent! Message ID:', data.MessageId);
    }
  });
}
