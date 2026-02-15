const mongoose = require('mongoose');

// OAuth2 Client schema
const oauthClientSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  clientSecret: { type: String, required: true },
  grants: { type: [String], default: ['client_credentials'] },
});

const OAuthClient = mongoose.model('OAuthClient', oauthClientSchema);

// OAuth2 Token schema
const oauthTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true, unique: true },
  accessTokenExpiresAt: { type: Date, required: true },
  client: { type: Object, required: true },
  user: { type: Object, required: true },
});

const OAuthToken = mongoose.model('OAuthToken', oauthTokenSchema);

module.exports = {
  async getClient(clientId, clientSecret) {
    const client = await OAuthClient.findOne({ clientId });
    if (!client) return null;
    if (clientSecret && client.clientSecret !== clientSecret) {
      return null;
    }
    return {
      id: client.clientId,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      grants: Array.from(client.grants),
    };
  },

  async saveToken(token, client, user) {
    const doc = await OAuthToken.create({
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client: { id: client.id || client.clientId },
      user: user || { id: client.id || client.clientId },
    });
    return {
      accessToken: doc.accessToken,
      accessTokenExpiresAt: doc.accessTokenExpiresAt,
      client: doc.client,
      user: doc.user,
    };
  },

  async getAccessToken(accessToken) {
    const token = await OAuthToken.findOne({ accessToken });
    if (!token) return null;
    return {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client: token.client,
      user: token.user,
    };
  },

  // Required for client_credentials grant
  async getUserFromClient(client) {
    return { id: client.id || client.clientId };
  },

  // Seed a client on startup if it doesn't exist
  async ensureClient(clientId, clientSecret) {
    const existing = await OAuthClient.findOne({ clientId });
    if (!existing) {
      await OAuthClient.create({ clientId, clientSecret, grants: ['client_credentials'] });
      console.log(`OAuth2 client "${clientId}" created`);
    }
  },
};
