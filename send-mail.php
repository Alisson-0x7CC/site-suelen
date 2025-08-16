<?php
// NADA de output antes dos headers!

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  exit;
}

// Helper p/ montar URL de retorno com query antes do hash
function with_query_before_hash(string $url, string $q): string {
  $parts = explode('#', $url, 2);
  $base  = $parts[0];
  $frag  = isset($parts[1]) ? '#'.$parts[1] : '';
  $sep   = (strpos($base,'?') !== false) ? '&' : '?';
  return $base . $sep . $q . $frag;
}

// Sanitiza/garante return_to seguro
$host   = $_SERVER['SERVER_NAME'] ?? '';
$return = filter_input(INPUT_POST, 'return_to', FILTER_SANITIZE_URL) ?: 'index.html#contato';
if (!preg_match('~^(?:/|https?://'.preg_quote($host,'~').')~', $return)) {
  $return = 'index.html#contato';
}

// Honeypot: finge sucesso e volta
if (!empty($_POST["_honeypot"] ?? "")) {
  header('Location: ' . with_query_before_hash($return, 'sent=1'));
  exit;
}

// Sanitização e validação
$name    = trim(strip_tags($_POST["name"] ?? ""));
$email   = trim($_POST["email"] ?? "");
$message = trim($_POST["message"] ?? "");

$valid = ($name !== "" && filter_var($email, FILTER_VALIDATE_EMAIL) && $message !== "");

// Monta e envia o e-mail
$success = false;
if ($valid) {
  $to       = "suelenvicent@gmail.com"; // destino
  $subject  = "Novo contato de {$name}";
  $domain   = preg_replace('/^www\./', '', $_SERVER['SERVER_NAME'] ?? 'seu-dominio.com.br');
  $from     = "no-reply@{$domain}";

  $headers  = "From: Suélen Vicente <{$from}>\r\n";
  $headers .= "Reply-To: {$name} <{$email}>\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

  $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
  $body  = "Nome: {$name}\n";
  $body .= "E-mail: {$email}\n\n";
  $body .= "Mensagem:\n{$message}\n";

  $success = @mail($to, $encodedSubject, $body, $headers, "-f {$from}");
}

// Redireciona com status
header('Location: ' . with_query_before_hash($return, $success ? 'sent=1' : 'error=1'));
exit;
