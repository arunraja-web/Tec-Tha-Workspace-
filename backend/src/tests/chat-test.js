const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';
dotenv.config();

const app = require('../app');
const User = require('../models/User');
const Group = require('../models/Group');
const Conversation = require('../models/Conversation');
const ConversationParticipant = require('../models/ConversationParticipant');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { initSocketServer } = require('../sockets/chatSocket');
const groupService = require('../services/groupService');

let server;
let ioServer;
let port = 5199;
let baseUrl = `http://127.0.0.1:${port}`;

const makeRequest = (method, path, body = null, cookie = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      const responseCookies = res.headers['set-cookie'] || [];

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsedData = {};
        try {
          if (data) parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = { raw: data };
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          cookies: responseCookies,
          body: parsedData
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runChatTests = async () => {
  console.log('🚀 Starting Real-Time Chat & Socket.IO Test Suite...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, failureDetail = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${failureDetail}`);
      failed++;
    }
  };

  let mongoServer;

  try {
    // 1. Connect to isolated In-Memory MongoDB Server
    let testMongoUri;
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      testMongoUri = mongoServer.getUri();
    } catch (e) {
      testMongoUri = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/company_workspace_chat_test';
    }

    await mongoose.connect(testMongoUri);
    await User.deleteMany({});
    await Group.deleteMany({});
    await Conversation.deleteMany({});
    await ConversationParticipant.deleteMany({});
    await Message.deleteMany({});
    await ActivityLog.deleteMany({});
    await Notification.deleteMany({});

    // 2. Start HTTP server & Socket.IO
    server = http.createServer(app);
    ioServer = initSocketServer(server);
    app.set('io', ioServer);

    await new Promise((resolve) => server.listen(port, resolve));

    console.log('--- TEST GROUP 1: User Setup & Authentication ---');
    // Create Admin
    const admin = await User.create({
      name: 'Chat Admin',
      email: 'admin@chat.com',
      phone: '1111111111',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true
    });

    // Create Founder
    const founder = await User.create({
      name: 'Chat Founder',
      email: 'founder@chat.com',
      phone: '2222222222',
      password: 'FounderPassword123!',
      role: 'founder',
      isActive: true
    });

    // Create Employee 1 (John)
    const john = await User.create({
      name: 'John Employee',
      email: 'john@chat.com',
      phone: '3333333333',
      password: 'JohnPassword123!',
      role: 'employee',
      isActive: true
    });

    // Create Employee 2 (Sarah - non group member)
    const sarah = await User.create({
      name: 'Sarah Employee',
      email: 'sarah@chat.com',
      phone: '4444444444',
      password: 'SarahPassword123!',
      role: 'employee',
      isActive: true
    });

    // Logins
    const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'admin@chat.com', password: 'AdminPassword123!' });
    const adminCookie = adminLogin.cookies.find((c) => c.includes('token=')).split(';')[0];

    const founderLogin = await makeRequest('POST', '/api/auth/login', { email: 'founder@chat.com', password: 'FounderPassword123!' });
    const founderCookie = founderLogin.cookies.find((c) => c.includes('token=')).split(';')[0];

    const johnLogin = await makeRequest('POST', '/api/auth/login', { email: 'john@chat.com', password: 'JohnPassword123!' });
    const johnCookie = johnLogin.cookies.find((c) => c.includes('token=')).split(';')[0];

    const sarahLogin = await makeRequest('POST', '/api/auth/login', { email: 'sarah@chat.com', password: 'SarahPassword123!' });
    const sarahCookie = sarahLogin.cookies.find((c) => c.includes('token=')).split(';')[0];

    assert(adminCookie && founderCookie && johnCookie && sarahCookie, 'All test users authenticated & cookies obtained');

    console.log('\n--- TEST GROUP 2: Direct Chat APIs ---');
    // Test 2.1: Create direct conversation John <-> Founder
    const createDirect1 = await makeRequest('POST', '/api/conversations/direct', { userId: founder._id.toString() }, johnCookie);
    assert(createDirect1.statusCode === 200, 'John creates direct conversation with Founder (200)');
    const directConvId = createDirect1.body.data.id || createDirect1.body.data._id;

    // Test 2.2: Existing direct conversation is reused (Deduplication)
    const createDirect2 = await makeRequest('POST', '/api/conversations/direct', { userId: john._id.toString() }, founderCookie);
    const reusedConvId = createDirect2.body.data.id || createDirect2.body.data._id;
    assert(createDirect2.statusCode === 200 && reusedConvId === directConvId, 'Founder opening chat with John reuses existing conversation ID');

    // Test 2.3: Cannot chat with yourself
    const selfChat = await makeRequest('POST', '/api/conversations/direct', { userId: john._id.toString() }, johnCookie);
    assert(selfChat.statusCode === 400, 'Cannot create direct conversation with yourself (400)');

    console.log('\n--- TEST GROUP 3: Group Chat Integration & Rules ---');
    // Admin creates group "Dev Team" (Founder automatically added)
    const devGroup = await groupService.createGroup(admin, { name: 'Dev Team', description: 'Development Team' });
    const groupId = devGroup._id.toString();

    // Admin adds John to group
    await groupService.addMember(admin, groupId, john._id.toString());

    // Fetch conversations for John (should see direct chat + Dev Team group chat)
    const johnConvs = await makeRequest('GET', '/api/conversations', null, johnCookie);
    assert(johnConvs.statusCode === 200 && johnConvs.body.data.length === 2, 'John sees 2 conversations (1 direct + 1 group)');

    const groupConvObj = johnConvs.body.data.find((c) => c.type === 'group');
    assert(groupConvObj !== undefined, 'Dev Team group conversation automatically synced');
    const groupConvId = groupConvObj.id || groupConvObj._id;

    // Non-member (Sarah) attempts to access group conversation -> MUST return 403
    const sarahAccess = await makeRequest('GET', `/api/conversations/${groupConvId}`, null, sarahCookie);
    assert(sarahAccess.statusCode === 403, 'Non-member Sarah rejected from group conversation (403)');

    console.log('\n--- TEST GROUP 4: Message Sending & Validations ---');
    // Test 4.1: Empty message rejection
    const emptyMsg = await makeRequest('POST', `/api/conversations/${directConvId}/messages`, { content: '   ' }, johnCookie);
    assert(emptyMsg.statusCode === 400, 'Empty whitespace message rejected (400)');

    // Test 4.2: John sends text message in direct chat
    const msg1 = await makeRequest('POST', `/api/conversations/${directConvId}/messages`, { content: 'Hello Founder!' }, johnCookie);
    assert(msg1.statusCode === 201, 'John sends message in direct conversation (201)');
    const msg1Id = msg1.body.data.id || msg1.body.data._id;

    // Check conversation lastMessage updated
    const convCheck = await makeRequest('GET', `/api/conversations/${directConvId}`, null, founderCookie);
    assert(convCheck.body.data.lastMessage !== null, 'Conversation lastMessage updated after message creation');

    // Test 4.3: Sarah attempts to send message in group conversation -> 403
    const sarahSend = await makeRequest('POST', `/api/conversations/${groupConvId}/messages`, { content: 'Imposter!' }, sarahCookie);
    assert(sarahSend.statusCode === 403, 'Non-member Sarah cannot send message to group chat (403)');

    // Test 4.4: Founder sends message in group chat
    const founderGroupMsg = await makeRequest('POST', `/api/conversations/${groupConvId}/messages`, { content: 'Welcome Dev Team!' }, founderCookie);
    assert(founderGroupMsg.statusCode === 201, 'Founder sends message in group chat (201)');

    console.log('\n--- TEST GROUP 5: Pagination, Editing & Soft Deletion ---');
    // Test 5.1: Pagination
    const pageMsgs = await makeRequest('GET', `/api/conversations/${groupConvId}/messages?limit=10`, null, johnCookie);
    assert(pageMsgs.statusCode === 200 && Array.isArray(pageMsgs.body.data.messages), 'GET messages returns paginated list');

    // Test 5.2: Message Edit by Sender vs Non-Sender
    const sarahEdit = await makeRequest('PUT', `/api/messages/${msg1Id}`, { content: 'Edited by Sarah' }, sarahCookie);
    assert(sarahEdit.statusCode === 403, 'Non-sender Sarah cannot edit John\'s message (403)');

    const johnEdit = await makeRequest('PUT', `/api/messages/${msg1Id}`, { content: 'Hello Founder! (Edited)' }, johnCookie);
    assert(johnEdit.statusCode === 200 && johnEdit.body.data.isEdited === true, 'Original sender John can edit message (200)');

    // Test 5.3: Soft Delete by Sender vs Non-Sender
    const founderDel = await makeRequest('DELETE', `/api/messages/${msg1Id}`, null, founderCookie);
    assert(founderDel.statusCode === 403, 'Non-sender Founder cannot delete John\'s message (403)');

    const johnDel = await makeRequest('DELETE', `/api/messages/${msg1Id}`, null, johnCookie);
    assert(johnDel.statusCode === 200 && johnDel.body.data.isDeleted === true, 'Original sender John soft-deletes own message (200)');

    console.log('\n--- TEST GROUP 6: Conversation Read Receipts & Unread Count ---');
    // Mark conversation read
    const readRes = await makeRequest('PATCH', `/api/conversations/${directConvId}/read`, {}, founderCookie);
    assert(readRes.statusCode === 200 && readRes.body.data.unreadCount === 0, 'Mark conversation read succeeds and returns unreadCount 0');

    console.log(`\n====================================================`);
    console.log(`CHAT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Chat Test Suite Error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  }
};

runChatTests();
