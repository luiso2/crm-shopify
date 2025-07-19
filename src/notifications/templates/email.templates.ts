export const emailTemplates = {
  welcome: {
    subject: 'Welcome to {{appName}}!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to {{appName}}!</h1>
            </div>
            <div class="content">
              <p>Hi {{userName}},</p>
              <p>We're excited to have you on board! Your account has been successfully created.</p>
              <p>Get started by exploring our features:</p>
              <ul>
                <li>Manage your customers and orders</li>
                <li>Track payments and subscriptions</li>
                <li>View analytics and reports</li>
              </ul>
              <p style="text-align: center; margin-top: 30px;">
                <a href="{{loginUrl}}" class="button">Go to Dashboard</a>
              </p>
            </div>
            <div class="footer">
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to {{appName}}!

Hi {{userName}},

We're excited to have you on board! Your account has been successfully created.

Get started by exploring our features:
- Manage your customers and orders
- Track payments and subscriptions
- View analytics and reports

Go to Dashboard: {{loginUrl}}

If you have any questions, feel free to contact our support team.

© {{year}} {{appName}}. All rights reserved.
    `,
  },
  orderConfirmation: {
    subject: 'Order Confirmation - Order #{{orderNumber}}',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-details { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .item { border-bottom: 1px solid #ddd; padding: 10px 0; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi {{customerName}},</p>
              <p>Thank you for your order! We've received your order and will process it shortly.</p>
              
              <div class="order-details">
                <h2>Order Details</h2>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                
                <h3>Items:</h3>
                {{#each items}}
                <div class="item">
                  <p><strong>{{this.name}}</strong></p>
                  <p>Quantity: {{this.quantity}} × ${{this.price}} = ${{this.total}}</p>
                </div>
                {{/each}}
                
                <p class="total">Total: ${{totalAmount}}</p>
              </div>
              
              <p>We'll send you another email when your order ships.</p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with us!</p>
              <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Order Confirmed!

Hi {{customerName}},

Thank you for your order! We've received your order and will process it shortly.

Order Details:
Order Number: {{orderNumber}}
Order Date: {{orderDate}}

Items:
{{#each items}}
- {{this.name}}
  Quantity: {{this.quantity}} × ${{this.price}} = ${{this.total}}
{{/each}}

Total: ${{totalAmount}}

We'll send you another email when your order ships.

Thank you for shopping with us!

© {{year}} {{appName}}. All rights reserved.
    `,
  },
  passwordReset: {
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi {{userName}},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="{{resetUrl}}" class="button">Reset Password</a>
              </p>
              
              <div class="warning">
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This link will expire in {{expiryHours}} hours</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change unless you click the link above</li>
                </ul>
              </div>
              
              <p>For security, this request was received from:</p>
              <p>IP Address: {{ipAddress}}<br>
              Browser: {{userAgent}}<br>
              Time: {{requestTime}}</p>
            </div>
            <div class="footer">
              <p>If you're having trouble, contact our support team.</p>
              <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Password Reset Request

Hi {{userName}},

We received a request to reset your password. Visit the link below to create a new password:

{{resetUrl}}

Important:
- This link will expire in {{expiryHours}} hours
- If you didn't request this, please ignore this email
- Your password won't change unless you click the link above

For security, this request was received from:
IP Address: {{ipAddress}}
Browser: {{userAgent}}
Time: {{requestTime}}

If you're having trouble, contact our support team.

© {{year}} {{appName}}. All rights reserved.
    `,
  },
};
