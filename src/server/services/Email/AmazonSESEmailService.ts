import { IEmailService } from "./IEmailService";

export class AmazonSESEmailService implements IEmailService {
  sendEmail(email: string, subject: string, body: string): Promise<void> {
  
    console.log(
      `Sending email via SES to ${email} with subject ${subject} and body ${body}`
    );

    return Promise.resolve();
  }
}
