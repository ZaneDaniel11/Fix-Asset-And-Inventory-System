<?php

include('./Connection.php');

$data = json_decode(file_get_contents("php://input"));

$name = $data->name;
$username = $data->username;
$password = $data->password;
$usertype = $data->usertype;
$email = $data->email;


$sql = "INSERT INTO users (name, username, password, usertype, email) VALUES ('$name', '$username', '$password', '$usertype', '$email')";

if ($conn->query($sql) === TRUE) {
    $response = array("success" => true, "user" => array("id" => $conn->insert_id, "name" => $name, "username" => $username, "password" => $password, "createdDate" => $createdDate, "usertype" => $usertype, "email" => $email));
} else {
    $response = array("success" => false, "error" => $conn->error);
}
echo json_encode($response);


$conn->close();
?>