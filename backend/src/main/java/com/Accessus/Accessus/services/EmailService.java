package com.Accessus.Accessus.services;

import com.Accessus.Accessus.entities.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private static final String LOGO_PATH = "static/images/ABC_solucoes3.png";
    private static final String LOGO_CID = "logoAbc";

    @Value("${app.mail.from}")
    private String mailFrom;

    @Autowired
    private JavaMailSender mailSender;

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

    public void sendConsolidadoDysrup(String to, byte[] anexo, String nomeArquivo) {
        String html = buildEmailTemplate(
                "Consolidado de Roteiros",
                "Olá!",
                "O consolidado de roteiros das equipes Dysrup foi gerado com sucesso.",
                "Segue em anexo o arquivo <strong>" + nomeArquivo + "</strong> com todas as lojas e atendimentos.",
                null,
                null,
                null
        );

        sendHtmlComAnexo(new String[]{ to }, "Consolidado de Roteiros - Dysrup", html, anexo, nomeArquivo);
    }

    private void sendHtmlComAnexo(String[] to, String subject, String html, byte[] anexo, String nomeAnexo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            ClassPathResource logo = new ClassPathResource(LOGO_PATH);
            helper.addInline(LOGO_CID, logo);
            helper.addAttachment(nomeAnexo, new ByteArrayResource(anexo));

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar e-mail com anexo", e);
        }
    }

    private void sendHtml(String[] to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    true,
                    "UTF-8"
            );

            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            ClassPathResource logo = new ClassPathResource(LOGO_PATH);
            helper.addInline(LOGO_CID, logo);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar e-mail HTML", e);
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
                                            <img src="cid:%s" alt="ABC Soluções" width="260" style="
                                                display: block;
                                                max-width: 260px;
                                                height: auto;
                                            ">
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
                LOGO_CID,
                title,
                greeting,
                paragraphOne,
                paragraphTwo,
                actionContent
        );
    }
}
