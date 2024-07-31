
import axios from "axios";
export async function FetchUserss()
{
try {
    const response = await axios.get(`http://localhost/Backend/Users/Read.php`);
    setUsers(response.data);
    console.log(response);
  } catch (error) {
    console.error("Failed to fetch users", error);
  }
}