<?php
include('../Connection.php');
if ($conn->connect_error) {
    die(json_encode(array("success" => false, "message" => "Connection failed: " . $conn->connect_error)));
}

$data = json_decode(file_get_contents("php://input"));

if (isset($data->username) && isset($data->password)) {
    $username = $conn->real_escape_string($data->username);
    $password = $conn->real_escape_string($data->password);

    $sql = "SELECT * FROM users_tb WHERE UserName = '$username'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
       
        if (password_verify($password, $row['Password'])) {
           
            $token = bin2hex(random_bytes(16));

            // Update the token in the database
            $sql = "UPDATE users_tb SET Token = '$token' WHERE UserId = " . $row['UserId'];
            if ($conn->query($sql) === TRUE) {
                echo json_encode(array("success" => true, "token" => $token));
            } else {
                echo json_encode(array("success" => false, "message" => "Error updating token"));
            }
        } else {
            echo json_encode(array("success" => false, "message" => "Invalid password"));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "User not found"));
    }
} else {
    echo json_encode(array("success" => false, "message" => "Invalid input"));
}

$conn->close();

?>