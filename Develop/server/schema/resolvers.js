const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { resolvetoken } = require('../utils/auth');

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
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        }
    },

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

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = resolvetoken(user);

            return { token, user };
        },

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