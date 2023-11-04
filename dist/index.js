//import { ApolloServer } from "@apollo/server";
import { schemaComposer } from "graphql-compose";
import mongoose from "mongoose";
import * as userController from "./User/User_controller.js";
import { UserTC } from "./User/User_model.js";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import httpHeadersPlugin from "apollo-server-plugin-http-headers";
export const uri = "mongodb+srv://Ulises_Fermin:44376612@cluster0.alwifue.mongodb.net/?retryWrites=true&w=majority";
let connection = null;
connection = await mongoose.connect(uri).then((conn) => {
    console.log("connected to db");
    return conn;
});
schemaComposer.add(UserTC);
console.log(UserTC.getFieldNames());
schemaComposer.Mutation.addFields({
    SingUp: userController.SingUp,
    SingIn: userController.signIn,
    SingOut: userController.singOut,
});
schemaComposer.Query.addFields({
    checkSignedInUser: userController.currentUser,
    userPagination: UserTC.mongooseResolvers.pagination(),
});
const schema = schemaComposer.buildSchema();
async function startApolloServer() {
    const app = express();
    app.use(cookieParser());
    const server = new ApolloServer({
        schema,
        plugins: [httpHeadersPlugin],
        context: {
            setCookies: [],
            setHeaders: [],
        },
    });
    await server.start();
    server.applyMiddleware({ app });
    await new Promise((resolve, reject) => app.listen({ port: 3000 }, () => resolve()));
    console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`);
    return { server, app };
}
startApolloServer();
