
using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;

namespace Daper.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientApiController : ControllerBase
    {
        
          private SqliteConnection _connection = new SqliteConnection("Data Source = exampleData.db");

        [HttpGet("GetClients")]
        public async Task<IActionResult> GetClients(){

            const string query = "Select * from Client";
            var result  = await _connection.QueryAsync<Client>(query);
            
            if(result.Count() == 0)
                return BadRequest("Sample Error Message...");

            return Ok(result);
        }

        [HttpPost("SaveClient")]
        public async Task<IActionResult> SaveClientAsync(Client client){
            
            const string query = "Insert into Client (ClientName, Residency) Values ( @ClientName, @Residency ); Select * from Client order by Id desc Limit 1";
            
            var result  = await _connection.QueryAsync<Client>(query, client);

            return Ok(result);
        }

        [HttpPut("UpdateClient")]
        public async Task<IActionResult> UpdateClientAsync(int Id, Client client){
            
            const string query = "Update Client set ClientName = @theClientName, Residency = @theResidency where Id = @Id; Select * from Client where Id = @Id limit 1 ";
            
            var result  = await _connection.QueryAsync<Client>(query, new {
                Id = Id,
                theClientName = client.ClientName,
                theResidency = client.Residency
            });

            return Ok(result);
        }

        [HttpDelete("DeleteClient")]
        public async Task<IActionResult> DeleteClient(int Id){
            
            const string query = "Delete From Client where Id = @Id; ";
            
            await _connection.QueryAsync<Client>(query, new { Id = Id,});

            return Ok();
        }
    }
}