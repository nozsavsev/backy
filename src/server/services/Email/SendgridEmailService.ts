import { IEmailService } from "./IEmailService";

export class SendGridEmailService implements IEmailService {
  sendEmail(email: string, subject: string, body: string): Promise<void> {
  
    console.log(
      `Sending email via SendGrid to ${email} with subject ${subject} and body ${body}`
    );

    return Promise.resolve();
  }
}
