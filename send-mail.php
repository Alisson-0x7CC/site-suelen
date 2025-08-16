<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  exit("Método não permitido.");
}

// Honeypot anti-spam
if (!empty($_POST["_honeypot"] ?? "")) {
  http_response_code(200);
  exit("OK");
}

// Sanitização e validação
$name    = trim(strip_tags($_POST["name"] ?? ""));
$email   = trim($_POST["email"] ?? "");
$message = trim($_POST["message"] ?? "");

if ($name === "" || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === "") {
  http_response_code(400);
  exit("Preencha os campos corretamente.");
}

// Destino
$to = "alissonmaciel966@gmail.com"; // <-- seu e-mail de destino

// Assunto
$subject = "Novo contato de {$name}";

// Corpo do e-mail
$body  = "Nome: {$name}\n";
$body .= "E-mail: {$email}\n\n";
$body .= "Mensagem:\n{$message}\n";

// From do seu domínio (melhor deliverability)
$domain = preg_replace('/^www\./', '', $_SERVER['SERVER_NAME'] ?? 'seu-dominio.com.br');
$from   = "no-reply@{$domain}";

// Cabeçalhos
$headers  = "From: Suélen Vicente <{$from}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Alguns provedores respeitam envelope sender (-f) para SPF
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

if (@mail($to, $encodedSubject, $body, $headers, "-f {$from}")) {
  http_response_code(200);
  echo "Mensagem enviada com sucesso!";
} else {
  http_response_code(500);
  echo "Ocorreu um erro ao enviar a mensagem.";
}

$return = filter_input(INPUT_POST, 'return_to', FILTER_SANITIZE_URL) ?: '/index.html#contato';
// opcional: força voltar pro mesmo site
if (!preg_match('~^/|^https?://seu-dominio\.com~', $return)) { $return = '/index.html#contato'; }

if ($sucesso) {
  $sep = (strpos($return,'?') !== false) ? '&' : '?';
  header('Location: ' . $return . $sep . 'sent=1');
  exit;
} else {
  $sep = (strpos($return,'?') !== false) ? '&' : '?';
  header('Location: ' . $return . $sep . 'error=1');
  exit;
}