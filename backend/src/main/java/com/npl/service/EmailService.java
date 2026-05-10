package com.npl.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.npl.exception.MailException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendEmailWithToken(String userEmail, String token) throws MessagingException, MailException {
        String link = frontendUrl + "/accept-invitation?token=" + token;

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        String subject = "You've been invited to join a project on Dynblath";
        String text = "<div style='font-family:Inter,sans-serif;max-width:520px;margin:auto'>"
                + "<h2 style='color:#0051ae'>You have a new project invitation</h2>"
                + "<p>You have been invited to collaborate on a project in Dynblath.</p>"
                + "<p>This invitation expires in <strong>7 days</strong>.</p>"
                + "<a href='" + link + "' "
                + "style='display:inline-block;padding:12px 24px;background:#0051ae;"
                + "color:#fff;border-radius:8px;text-decoration:none;font-weight:700'>"
                + "Accept Invitation</a>"
                + "<p style='color:#888;font-size:12px;margin-top:24px'>"
                + "If you did not expect this invitation, you can safely ignore this email.</p>"
                + "</div>";

        helper.setSubject(subject);
        helper.setText(text, true);
        helper.setTo(userEmail);

        try {
            javaMailSender.send(mimeMessage);
        } catch (org.springframework.mail.MailException e) {
            throw new MailException("Failed to send invitation email to " + userEmail);
        }
    }
}