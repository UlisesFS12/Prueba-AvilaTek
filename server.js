"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const mongodb_1 = require("mongodb");
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield mongodb_1.MongoClient.connect("mongodb://localhost:27017");
        const db = client.db('myDatabase');
        const typeDefs = `
        type Query {
            hello: String
        }
    `;
        const resolvers = {
            Query: {
                hello: () => 'Hello world!'
            }
        };
        const server = new apollo_server_1.ApolloServer({ typeDefs, resolvers });
        server.listen().then(({ url }) => {
            console.log(`🚀 Server ready at ${url}`);
        });
    });
}
startServer();
