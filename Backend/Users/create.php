<?php
include('../Connection.php');

// Retrieve the raw POST data
$data = json_decode(file_get_contents("php://input"));

// Check if data is valid
if (isset( $data->username, $data->password, $data->usertype, $data->email)) {
    $username = $data->username;
    $password = $data->password;
    $usertype = $data->usertype;
    $email = $data->email;

    // Prepare an SQL statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO users_tb (UserName, Password, UserType, Email) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $name, $username, $password, $usertype, $email);

    if ($stmt->execute()) {
        $createdDate = date('Y-m-d H:i:s'); // Assuming you want the current date and time
        $response = array(
            "success" => true,
            "user" => array(
                "UserId" => $conn->insert_id,
                "Username" => $username,
                "Password" => $password,
                "CreatedDate" => $createdDate,
                "UserType" => $usertype,
                "Email" => $email
            )
        );
    } else {
        $response = array("success" => false, "error" => $stmt->error);
    }

    $stmt->close();
} else {
    $response = array("success" => false, "error" => "Invalid input data.");
}

echo json_encode($response);

$conn->close();
?>