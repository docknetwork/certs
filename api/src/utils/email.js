import AWS from 'aws-sdk';

// The AWS Region that you want to use to send the email. For a list of
// AWS Regions where the Amazon Pinpoint API is available, see
// https://docs.aws.amazon.com/pinpoint/latest/apireference/
const aws_region = 'us-west-2';

// The "From" address. This address has to be verified in Amazon Pinpoint
// in the region that you use to send email.
const senderAddress = 'marketing@dock.io';

// The Amazon Pinpoint project/application ID to use when you send this message.
// Make sure that the SMS channel is enabled for the project or application
// that you choose.
const appId = '74e0539b9d174cef9fa4b2384dae7f06';

// The subject line of the email.
const subject = 'Amazon Pinpoint (AWS SDK for JavaScript in Node.js)';

// The email body for recipients with non-HTML email clients.
const body_text = `Amazon Pinpoint Test (SDK for JavaScript in Node.js)
----------------------------------------------------
This email was sent with Amazon Pinpoint using the AWS SDK for JavaScript in Node.js.
For more information, see https:\/\/aws.amazon.com/sdk-for-node-js/`;

// The body of the email for recipients whose email clients support HTML content.
const body_html = `<html>
<head></head>
<body>
  <h1>Amazon Pinpoint Test (SDK for JavaScript in Node.js)</h1>
  <p>This email was sent with
    <a href='https://aws.amazon.com/pinpoint/'>the Amazon Pinpoint API</a> using the
    <a href='https://aws.amazon.com/sdk-for-node-js/'>
      AWS SDK for JavaScript in Node.js</a>.</p>
</body>
</html>`;

// The character encoding the you want to use for the subject line and
// message body of the email.
const charset = 'UTF-8';

// Specify that you're using a shared credentials file.
const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;

// Specify the region.
AWS.config.update({ region: aws_region });

// Create a new Pinpoint object.
const pinpoint = new AWS.Pinpoint();

export default function sendEmail(email, recipientName, recipientRef, issuerName) {
  // Specify the parameters to pass to the API.
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

      MessageConfiguration: { /* required */
        EmailMessage: {
          FromAddress: senderAddress,
        },
      },

      // MessageConfiguration: {
      //   EmailMessage: {
      //     FromAddress: senderAddress,
      //     SimpleEmail: {
      //       Subject: {
      //         Charset: charset,
      //         Data: subject
      //       },
      //       HtmlPart: {
      //         Charset: charset,
      //         Data: body_html
      //       },
      //       TextPart: {
      //         Charset: charset,
      //         Data: body_text
      //       }
      //     }
      //   }
      // }
    },
  };

  // Try to send the email.
  pinpoint.sendMessages(params, (err, data) => {
    // If something goes wrong, print an error message.
    if (err) {
      console.log(err.message);
    } else {
      console.log('Email sent! Message ID: ', data.MessageResponse.Result[email].MessageId);
    }
  });
}
