<?php
// send.php – tar imot PDF og sender epost

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo "Ingen fil mottatt.";
    exit;
}

$to = "bluebook@vosstaxi.no";
$from = "no-reply@vosstaxi.no";

// Hent info om fil
$file_tmp = $_FILES['file']['tmp_name'];
$file_name = $_FILES['file']['name'];
$file_size = $_FILES['file']['size'];
$file_type = $_FILES['file']['type'];

// Les inn filinnhold
$file_content = file_get_contents($file_tmp);
$file_content = chunk_split(base64_encode($file_content));

// Bruk filnavn som subject
$subject = $file_name;

// Unik boundary
$separator = md5(time());
$eol = "\r\n";

// Headers
$headers = "From: ".$from.$eol;
$headers .= "MIME-Version: 1.0".$eol;
$headers .= "Content-Type: multipart/mixed; boundary=\"".$separator."\"".$eol;

// Body
$body = "--".$separator.$eol;
$body .= "Content-Type: text/plain; charset=\"utf-8\"".$eol;
$body .= "Content-Transfer-Encoding: 7bit".$eol.$eol;
$body .= "Se vedlagt PDF.".$eol;

$body .= "--".$separator.$eol;
$body .= "Content-Type: application/pdf; name=\"".$file_name."\"".$eol;
$body .= "Content-Transfer-Encoding: base64".$eol;
$body .= "Content-Disposition: attachment; filename=\"".$file_name."\"".$eol.$eol;
$body .= $file_content.$eol;
$body .= "--".$separator."--";

// Send epost
if (mail($to, $subject, $body, $headers)) {
    echo "Epost sendt OK";
} else {
    http_response_code(500);
    echo "Feil ved sending av epost.";
}
