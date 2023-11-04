import { composeMongoose } from "graphql-compose-mongoose";
import { schemaComposer } from "graphql-compose";
import { model, Schema } from "mongoose";
export const userSchema = new Schema({
    First_name: {
        type: String,
        required: [true, "Es necesario ingresar un primer nombre al ususario"],
    },
    Last_name: {
        type: String,
        required: [true, "Es necesario ingresar un apellido al usuario"],
    },
    email: {
        type: String,
        required: [true, "Es necesario ingresar un email al usuario"],
    },
    password: {
        type: String,
        required: [true, "Es necesario ingresar una contraseña al usuario"],
    },
    active: {
        type: Boolean,
        default: true,
    },
});
export const UserTC = composeMongoose(model("User", userSchema));
schemaComposer.add(UserTC);
UserTC.addResolver({
    name: "findByEmail",
    type: UserTC,
    args: { email: "String" },
    resolve: async ({ args }) => {
        const user = await UserTC.mongooseResolvers
            .findOne()
            .resolve({ args: { filter: { email: args.email } } });
        return user;
    },
});
schemaComposer.Query.addFields({
    userByEmail: UserTC.getResolver("findByEmail"),
});
