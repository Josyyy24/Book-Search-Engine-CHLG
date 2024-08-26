const { AuthenticationError } = require('apollo-server-express');
const { argsToArgsConfig } = require('graphql/type/definition');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const authorize = (context) => {
    const token = context.req.headers.authorization;

    if (!token) {
        throw new AuthenticationError('You need to be logged in!');
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return user;
    } catch (err) {
        console.log('Invalid token');
        throw new AuthenticationError('Invalid token');
    }
}

const resolvers = {

    Query: {    
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id })
            }
            throw new AuthenticationError('Not logged in');
        }
    },

    //Signs in the user
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = resolvetoken(user);

            return { token, user };
        },
        //Adds a new user
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = resolvetoken(user);

            return { token, user };
        },
        //Saves a book to the user's account
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        //Removes a book from the user's account
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
};

module.exports = resolvers;