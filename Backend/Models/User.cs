namespace Backend.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UserType { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
    }
}
