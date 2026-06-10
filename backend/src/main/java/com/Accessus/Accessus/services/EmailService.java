package com.Accessus.Accessus.services;

import com.Accessus.Accessus.entities.User;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class EmailService {

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    public void sendUserActivation(String to, String activationLink) {
        String html = buildEmailTemplate(
                "Ativação de conta",
                "Olá!",
                "Sua conta foi criada com sucesso no Accessus.",
                "Para começar a usar o sistema, clique no botão abaixo e ative sua conta.",
                "Ativar conta",
                activationLink,
                null
        );
        sendHtml(new String[]{ to }, "Ative sua conta - Accessus", html);
    }

    public void sendPasswordReset(String to, String code) {
        String html = buildEmailTemplate(
                "Recuperação de senha",
                "Olá!",
                "Recebemos uma solicitação para redefinir sua senha.",
                "Use o código abaixo para continuar com a recuperação:",
                null,
                null,
                code
        );
        sendHtml(new String[]{ to }, "Recuperação de senha - Accessus", html);
    }

    public void sendCandidateForm(String to, String formLink) {
        String html = buildEmailTemplate(
                "Formulário de admissão",
                "Olá!",
                "Você recebeu um formulário de admissão da ABC Soluções.",
                "Clique no botão abaixo para preencher suas informações de forma segura.",
                "Preencher formulário",
                formLink,
                null
        );
        sendHtml(new String[]{ to }, "Formulário de Admissão - ABC Soluções", html);
    }

    public void sendTicketCreatedForApplicant(User createdBy, String to, String ticketLink) {
        String html = buildEmailTemplate(
                "Novo chamado aberto",
                "Olá!",
                "O usuário " + createdBy.getName() + " abriu um chamado informando você como solicitante.",
                "Para visualizar os detalhes, clique no botão abaixo:",
                "Ver chamado",
                ticketLink,
                null
        );
        sendHtml(new String[]{ to }, "Novo chamado aberto - Accessus", html);
    }

    public void sendTicketCreatedForAssigned(User createdBy, String to, String ticketLink) {
        String html = buildEmailTemplate(
                "Novo chamado atribuído a você",
                "Olá!",
                "O usuário " + createdBy.getName() + " abriu um chamado e atribuiu diretamente a você.",
                "Para visualizar os detalhes, clique no botão abaixo:",
                "Ver chamado",
                ticketLink,
                null
        );
        sendHtml(new String[]{ to }, "Novo chamado atribuído a você - Accessus", html);
    }

    public void sendTicketStatusChanged(String to, String ticketTitle, String newStatus, String ticketLink) {
        String html = buildEmailTemplate(
                "Status do chamado atualizado",
                "Olá!",
                "O status do chamado <strong>" + ticketTitle + "</strong> foi atualizado para <strong>" + newStatus + "</strong>.",
                "Para visualizar os detalhes, clique no botão abaixo:",
                "Ver chamado",
                ticketLink,
                null
        );
        sendHtml(new String[]{ to }, "Status do chamado atualizado - Accessus", html);
    }

    public void sendTicketCreatedForDepartment(User createdBy, List<String> recipients, String ticketLink) {
        String html = buildEmailTemplate(
                "Novo chamado para o seu setor",
                "Olá!",
                "O usuário " + createdBy.getName() + " abriu um chamado direcionado ao seu setor.",
                "Para visualizar os detalhes, clique no botão abaixo:",
                "Ver chamado",
                ticketLink,
                null
        );
        sendHtml(recipients.toArray(String[]::new), "Novo chamado para o seu setor - Accessus", html);
    }

    private void sendHtml(String[] to, String subject, String html) {
        Email from = new Email(mailFrom, "Accessus");
        Content content = new Content("text/html", html);

        for (String recipient : to) {
            Mail mail = new Mail(from, subject, new Email(recipient), content);
            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            try {
                request.setMethod(Method.POST);
                request.setEndpoint("mail/send");
                request.setBody(mail.build());
                Response response = sg.api(request);
                if (response.getStatusCode() >= 400) {
                    throw new RuntimeException("SendGrid erro " + response.getStatusCode() + ": " + response.getBody());
                }
            } catch (IOException e) {
                throw new RuntimeException("Erro ao enviar e-mail via SendGrid", e);
            }
        }
    }

    private String buildEmailTemplate(
            String title,
            String greeting,
            String paragraphOne,
            String paragraphTwo,
            String buttonText,
            String buttonLink,
            String highlightCode
    ) {
        String actionContent = "";

        if (buttonText != null && buttonLink != null) {
            actionContent = """
                    <tr>
                        <td align="center" style="padding: 28px 0 12px 0;">
                            <a href="%s" target="_blank" style="
                                display: inline-block;
                                background-color: #f5a000;
                                color: #111111;
                                text-decoration: none;
                                padding: 14px 30px;
                                border-radius: 8px;
                                font-size: 15px;
                                font-weight: bold;
                            ">
                                %s
                            </a>
                        </td>
                    </tr>
                    """.formatted(buttonLink, buttonText);
        }

        if (highlightCode != null) {
            actionContent = """
                    <tr>
                        <td align="center" style="padding: 24px 0 12px 0;">
                            <div style="
                                display: inline-block;
                                background-color: #f6f6f6;
                                border: 1px solid #dddddd;
                                border-radius: 8px;
                                padding: 16px 28px;
                                color: #f5a000;
                                font-size: 30px;
                                font-weight: bold;
                                letter-spacing: 6px;
                            ">
                                %s
                            </div>
                        </td>
                    </tr>
                    """.formatted(highlightCode);
        }

        return """
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%s</title>
                </head>
                <body style="
                    margin: 0;
                    padding: 0;
                    background-color: #f2f2f2;
                    font-family: Arial, Helvetica, sans-serif;
                ">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2; padding: 32px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="
                                    background-color: #ffffff;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    border: 1px solid #e5e5e5;
                                ">
                                    <tr>
                                        <td style="
                                            background-color: #000000;
                                            padding: 32px 36px;
                                            text-align: left;
                                        ">
                                            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">ABC Soluções</p>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            background-color: #f5a000;
                                            padding: 26px 36px;
                                        ">
                                            <h1 style="
                                                margin: 0;
                                                color: #111111;
                                                font-size: 26px;
                                                font-weight: bold;
                                            ">
                                                %s
                                            </h1>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding: 36px;">
                                            <h2 style="
                                                margin: 0 0 22px 0;
                                                color: #111111;
                                                font-size: 22px;
                                                font-weight: bold;
                                            ">
                                                %s
                                            </h2>

                                            <p style="
                                                margin: 0 0 16px 0;
                                                color: #444444;
                                                font-size: 15px;
                                                line-height: 1.6;
                                            ">
                                                %s
                                            </p>

                                            <p style="
                                                margin: 0;
                                                color: #444444;
                                                font-size: 15px;
                                                line-height: 1.6;
                                            ">
                                                %s
                                            </p>

                                            <table width="100%%" cellpadding="0" cellspacing="0">
                                                %s
                                            </table>

                                            <p style="
                                                margin: 28px 0 0 0;
                                                color: #777777;
                                                font-size: 13px;
                                                line-height: 1.5;
                                            ">
                                                Caso você não tenha solicitado este e-mail, ignore esta mensagem.
                                            </p>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            background-color: #111111;
                                            padding: 22px 36px;
                                            text-align: center;
                                        ">
                                            <p style="
                                                margin: 0;
                                                color: #ffffff;
                                                font-size: 12px;
                                                line-height: 1.5;
                                            ">
                                                © ABC Soluções em Vendas - Sistema Accessus
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                title,
                title,
                greeting,
                paragraphOne,
                paragraphTwo,
                actionContent
        );
    }
}
