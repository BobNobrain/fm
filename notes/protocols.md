# Thoughts about Protocols

## Participants

Both clients should be connected to the same server, no interserver communication
is intended. However, in some sophisticated cases, a server can pretend to be a client
and communicate with clients of other servers on behalf of its own clients, hiding
real sender of messages into some encrypted data.

## Layers

We need 2 layers (2 protocols on top of each other): general *transport* and
*messenger implementation*.

### Transport

Transport protocol solves these issues:

- **datalayer** – encoding and decoding data
- **security** – encrypting and decrypting of data with different keys needed
- **delivery** – ensuring that datagram is delivered to receiver client or server (if requested)

#### Datalayer

Is actually implemented for now. It will probably be extended and properly documented later,
but basically it is solved.

#### Security

Problems:

- **partial e2e encryption**: e2e encryption that allows all included participants
  to read the data they allowed to read and no more
  - coming to agreement on what is disclosed and what is not
- **group chats**: e2e encryption for channels with more than 2 participants (which is
  not a problem on a trusted server, but is on untrusted third-party one)
- **corectness check**: after we have decrypted the message, we need to be able to quickly
  check if it is correct and we used the right key for decryption

##### Partial E2E Encryption

The response of the public info handle should include config on what fields server
demands to read. If this is acceptable for the client, it proceeds to connect.

The fields of every action that server demands to be open must be encrypted with
server's public key, so the content can be read by the server. When transmitting the
message to the client, server reencrypts open fields with it's own private key for
the recepient, so it can then read them.

So the minimal info that server can have about a message being sent is what client
has sent it, and what client is an intended recipient. This is a very simple
"retransmitter server".

Some servers may require access to some data about user, message channel, etc.,
to share them publicly.

Public servers can demand access for partial info about message being sent to filter
spam messages, etc. It can also require full disclosure of messages in some cases for
the same purpose – e.g. if user A is not in a "contact list" of user B, server will
demand user A to open its messages so it can be spam-checked.

A very paranoid server can demand access to all messages content, which is acceptable
for something like corporate servers.

##### Group Chats

Group chats will be created in 2 modes: trusted server and untrusted one.

On trusted server, the server will handle master key for the chat, re-encrypting all
messages for every participant. This implies server has full access to message content.

On untrusted server, the following solutions are possible.

Firstly, one of the clients can be chosen as a master that re-encrypts all messages.
This role can be passed to other client that is online, so when one master goes offline,
another can appear and continue supporting the chat.

The other method is to encrypt a copy of the message for every participant in the chat.
This is, of course, applicable only to small groups. Also, this method has no way to
guarantee that the message is the same for everybody.

The final way of doing the group chat is generating a master key on chat creation
and then giving it away for every chat participant in encrypted 1-to-1 connection.

#### Delivery

For untrusted servers, we need a way for clients to ensure they got their messages.

### Messenger

Messenger implementation protocol uses trasport protocol that provides specified guarantees
and allows to syncronize basic messenger entities over it: messages, channels, etc.

The main idea is that socket messages are used to represent events happened to some
objects: e.g., chat title changed, user has gone offline, a message has been published, etc.
Every such action has a target object, an action that can be applied to it, and some action
payload (like new chat title, or message content).

If client needs to fetch some data from server – e.g. after loading up, it will not do it
via socket, but instead via other methods – like simple HTTP request. Although it is not
mandatory, and fetching over sockets may be supported too.

#### Entities and actions

Minimal entity set and field sets they support (all of these are mandatory for every
implementation of protocol):

- `User`
  - `User.ID id` (aka username)
  - `PublicKey pb`
- `Client`:
  - `Client.ID id`
  - `User.ID userId`
  - `bool connected`: if client is online/offline
- `PrivateChat`
  - `PrivateChat.ID id`
  - `[User.ID, User.ID] members`
- `GroupChat`
  - `GroupChat.ID id`
  - `User.ID[] members`
  - `PublicKey pb`
- `Message`
  - `Client.ID from`
  - `User.ID to`
  - `Date sent`

CUD events for every entity:

- `created(Entity e)`
- `updated(Patch<Entity> patch)`
- `deleted(Entity.ID id)`

### Others

There are some tasks that are not supposed to be handled via protocols described above.
These include fetching objects (like at client initial load), exchanging public keys, etc.
Implementations should use something REST-like to do these.
