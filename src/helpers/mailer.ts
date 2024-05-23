import User from '@/models/userModel';
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs'

type UserType = {
    email: string,
    emailType: string,
    userId: string
}

export const sendEmail = async ({
    email,
    emailType,
    userId
}: UserType) => {

    try {
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {
            const updatedUser = await User.findByIdAndUpdate(userId, {
                $set: {
                    verifyToken: hashedToken,
                    varifyTokenExpiry: new Date(Date.now() + 3600000)
                }
            })
            console.log("Updated Uset for VERIFY", updatedUser);
            
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId, {
                $set: {
                    forgotPasswordToken: hashedToken,
                    forgotPasswordTokenExpiry: new Date(Date.now() + 3600000)
                }
            })
        }

        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "31e8de0f124e32", //❌
                pass: "75ca8bda5b5c68" //❌
            }
        });

        const mailOptions = {
            from: 'maddison53@ethereal.email', // sender address
            to: email, // list of receivers
            subject: emailType === 'VERIFY' ? "Verify your email" : "Reset your password", // Subject line
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} or copy and paste the link below in your browser.
                <br/> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
                </p>`, // html body
        }

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;
    } catch (err: any) {
        throw new Error(err.message)
    }
}