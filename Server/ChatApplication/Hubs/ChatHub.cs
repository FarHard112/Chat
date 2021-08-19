using ChatApplication.Data;
using ChatApplication.Models;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatApplication.Hubs
{
    public class ChatHub : Hub
    {
        public async Task GetNickName(string NickName)
        {
            Client client = new Client()
            {
                ConnectionId = Context.ConnectionId,
                NickName = NickName
            };
            ClientSource.Clients.Add(client);
            await Clients.Others.SendAsync("userJoined", NickName);
            await Clients.All.SendAsync("clients", ClientSource.Clients);
        }
        public async Task SendMessageAsync(string message, string clientName)
        {
            Client senderClient = ClientSource.Clients.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);

            if (clientName.Trim() == "Hamıya")
            {
                await Clients.All.SendAsync("receiveMessage", message, senderClient.NickName);
            }
            else
            {
                Client client = ClientSource.Clients.FirstOrDefault(x => x.NickName == clientName);
                await Clients.Client(client.ConnectionId).SendAsync("receiveMessage", message, senderClient.NickName);
            }


        }

        public async Task AddGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            Group group = new Group() { GroupName = groupName };
            group.Clients.Add(ClientSource.Clients.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId));
            GroupSource.Groups.Add(group);
            await Clients.All.SendAsync("groups", GroupSource.Groups);
        }
        public async Task AddClientToGroup(IEnumerable<string> groupNames)
        {
            Client client = ClientSource.Clients.FirstOrDefault(c => c.ConnectionId == Context.ConnectionId);

            foreach (var group in groupNames)
            {
                Group _group = GroupSource.Groups.FirstOrDefault(g => g.GroupName == group);
                var result = _group.Clients.Any(x => x.ConnectionId == Context.ConnectionId);
                if (!result)
                {
                    _group.Clients.Add(client);
                    await Groups.AddToGroupAsync(Context.ConnectionId, group);
                }

            }

        }
        public async Task ClientGroup(string groupName)
        {

            Group group = GroupSource.Groups.
                FirstOrDefault(g => g.GroupName == groupName);
            await Clients.Caller.SendAsync("clients", groupName == "-1" ? ClientSource.Clients : group.Clients);


        }
        public async Task SendMessageToGroup(string groupName, string message)
        {
            await Clients.Group(groupName).SendAsync("receiveMessage"
                , message, ClientSource.Clients.FirstOrDefault
                (x => x.ConnectionId == Context.ConnectionId).NickName);
        }
    }
}
