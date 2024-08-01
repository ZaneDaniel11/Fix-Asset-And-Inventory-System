<?php
include('../Connection.php');

// Get the posted data
$data = json_decode(file_get_contents("php://input"), true);
$UserName = $data['UserName'] ?? '';
$Password = $data['Password'] ?? '';
$UserType = $data['UserType'] ?? '';
$Email = $data['Email'] ?? '';
$CreatedDate = date('Y-m-d'); 

// Log received data for debugging
error_log("Received data: " . print_r($data, true));

// Validate the input data
if(empty($UserName) || empty($Password) || empty($UserType) || empty($Email)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
    exit();
}

// Hash the password
$hashedPassword = password_hash($Password, PASSWORD_DEFAULT);

// Prepare and execute the insert query
$sql = "INSERT INTO users_tb (UserName, Password, CreatedDate, UserType, Email) VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to prepare the SQL statement.']);
    exit();
}

$stmt->bind_param('sssss', $UserName, $hashedPassword, $CreatedDate, $UserType, $Email);
$executeSuccess = $stmt->execute();

if ($executeSuccess) {
    echo json_encode(['status' => 'success', 'message' => 'User added successfully.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to add user.']);
}

$stmt->close();
$conn->close();
?>