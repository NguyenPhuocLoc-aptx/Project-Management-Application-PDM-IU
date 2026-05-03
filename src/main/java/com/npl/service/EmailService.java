package com.npl.service;

import org.springframework.beans.factory.annotation.Autowired;
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


    public void sendEmailWithToken(String userEmail, String link) throws MessagingException, MailException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
        

        String subject = "Join Project Team Invitation";
        String text = "Click the link to join the project team: " + link;

        helper.setSubject(subject);
        helper.setText(text, true);
        helper.setTo(userEmail);

        try {
            javaMailSender.send(mimeMessage);
        } catch (org.springframework.mail.MailException e) {
            throw new MailException("Failed to send email");
        }
    }
}

