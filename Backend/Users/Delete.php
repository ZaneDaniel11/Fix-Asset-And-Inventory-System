<?php
include('../Connection.php');

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    
    $stmt = $conn->prepare("DELETE FROM users_tb WHERE UserId = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        $response = array("success" => true, "message" => "User deleted successfully.");
    } else {
        $response = array("success" => false, "error" => $stmt->error);
    }

    $stmt->close();
} else {
    $response = array("success" => false, "error" => "No user ID provided.");
}

echo json_encode($response);

$conn->close();
?>