<?php
include('../Connection.php');

$response = array("success" => false, "error" => "Missing required fields.");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if all required fields are present
    if (isset($_POST['username']) && isset($_POST['Password']) && isset($_POST['Email']) && isset($_POST['usertype'])) {
        $username = $_POST['username'];
        $password = $_POST['Password'];
        $email = $_POST['Email'];
        $usertype = $_POST['usertype'];

        // Prepare the SQL statement
        $stmt = $conn->prepare("INSERT INTO users_tb (UserName, Password, Email, UserType) VALUES (?, ?, ?, ?)");
        if ($stmt === false) {
            $response = array("success" => false, "error" => $conn->error);
        } else {
            // Bind the parameters (s = string, i = integer, d = double, b = blob)
            $stmt->bind_param("ssss", $username, $password, $email, $usertype);

            // Execute the statement
            if ($stmt->execute()) {
                $response = array("success" => true, "message" => "User added successfully.");
            } else {
                $response = array("success" => false, "error" => $stmt->error);
            }

            // Close the statement
            $stmt->close();
        }
    } else {
        $response = array("success" => false, "error" => "Missing required fields.");
    }
}

echo json_encode($response);
$conn->close();
?>