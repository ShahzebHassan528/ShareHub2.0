/**
 * Message Model - Sequelize Wrapper
 * 
 * Provides messaging functionality with clean API
 * Integrated with existing User model
 */

const { Message: MessageModel, User: UserModel } = require('../database/models');
const { Op } = require('sequelize');

class Message {
  /**
   * Send a message from one user to another
   * @param {number} senderId - ID of the sender
   * @param {number} receiverId - ID of the receiver
   * @param {string} message - Message content
   * @returns {Promise<Object>} - Created message object
   */
  static async sendMessage(senderId, receiverId, message) {
    console.log('🔷 [Sequelize] Message.sendMessage() called');
    console.log(`   Sender: ${senderId}, Receiver: ${receiverId}`);
    
    try {
      // Validate users exist
      const sender = await UserModel.findByPk(senderId);
      const receiver = await UserModel.findByPk(receiverId);
      
      if (!sender) {
        throw new Error('Sender not found');
      }
      
      if (!receiver) {
        throw new Error('Receiver not found');
      }
      
      // Create message
      const newMessage = await MessageModel.create({
        sender_id: senderId,
        receiver_id: receiverId,
        message: message.trim(),
        is_read: false,
        created_at: new Date()
      });
      
      console.log('✅ [Sequelize] Message sent successfully, ID:', newMessage.id);
      
      // Return message with sender/receiver info
      const messageWithUsers = await MessageModel.findByPk(newMessage.id, {
        include: [
          {
            model: UserModel,
            as: 'sender',
            attributes: ['id', 'email', 'full_name', 'role']
          },
          {
            model: UserModel,
            as: 'receiver',
            attributes: ['id', 'email', 'full_name', 'role']
          }
        ]
      });
      
      return messageWithUsers.toJSON();
    } catch (error) {
      console.error('❌ [Sequelize] Message.sendMessage() failed:', error.message);
      throw error;
    }
  }

  /**
   * Get conversation between two users
   * @param {number} user1Id - First user ID
   * @param {number} user2Id - Second user ID
   * @param {Object} options - Query options (limit, offset)
   * @returns {Promise<Array>} - Array of messages
   */
  static async getConversation(user1Id, user2Id, options = {}) {
    console.log('🔷 [Sequelize] Message.getConversation() called');
    console.log(`   User1: ${user1Id}, User2: ${user2Id}`);
    
    try {
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      
      const messages = await MessageModel.findAll({
        where: {
          [Op.or]: [
            {
              sender_id: user1Id,
              receiver_id: user2Id
            },
            {
              sender_id: user2Id,
              receiver_id: user1Id
            }
          ]
        },
        include: [
          {
            model: UserModel,
            as: 'sender',
            attributes: ['id', 'email', 'full_name', 'role']
          },
          {
            model: UserModel,
            as: 'receiver',
            attributes: ['id', 'email', 'full_name', 'role']
          }
        ],
        order: [['created_at', 'ASC']],
        limit,
        offset
      });
      
      console.log(`✅ [Sequelize] Found ${messages.length} messages`);
      
      return messages.map(msg => msg.toJSON());
    } catch (error) {
      console.error('❌ [Sequelize] Message.getConversation() failed:', error.message);
      throw error;
    }
  }

  /**
   * Mark a message as read
   * @param {number} messageId - Message ID
   * @param {number} userId - User ID (must be receiver)
   * @returns {Promise<boolean>} - True if marked as read
   */
  static async markAsRead(messageId, userId) {
    console.log('🔷 [Sequelize] Message.markAsRead() called');
    console.log(`   Message ID: ${messageId}, User ID: ${userId}`);
    
    try {
      const message = await MessageModel.findByPk(messageId);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      // Only receiver can mark as read
      if (message.receiver_id !== userId) {
        throw new Error('Unauthorized: Only receiver can mark message as read');
      }
      
      if (message.is_read) {
        console.log('ℹ️  [Sequelize] Message already marked as read');
        return true;
      }
      
      await message.update({ is_read: true });
      
      console.log('✅ [Sequelize] Message marked as read');
      return true;
    } catch (error) {
      console.error('❌ [Sequelize] Message.markAsRead() failed:', error.message);
      throw error;
    }
  }

  /**
   * Mark all messages in a conversation as read
   * @param {number} userId - Current user ID (receiver)
   * @param {number} otherUserId - Other user ID (sender)
   * @returns {Promise<number>} - Number of messages marked as read
   */
  static async markConversationAsRead(userId, otherUserId) {
    console.log('🔷 [Sequelize] Message.markConversationAsRead() called');
    console.log(`   User: ${userId}, Other User: ${otherUserId}`);
    
    try {
      const [updatedCount] = await MessageModel.update(
        { is_read: true },
        {
          where: {
            receiver_id: userId,
            sender_id: otherUserId,
            is_read: false
          }
        }
      );
      
      console.log(`✅ [Sequelize] Marked ${updatedCount} messages as read`);
      return updatedCount;
    } catch (error) {
      console.error('❌ [Sequelize] Message.markConversationAsRead() failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all chat conversations for a user
   * Returns list of users they've chatted with and last message
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Array of chat conversations
   */
  static async getUserChats(userId) {
    console.log('🔷 [Sequelize] Message.getUserChats() called');
    console.log(`   User ID: ${userId}`);
    
    try {
      const { sequelize } = require('../database/models');
      
      // Get all unique users this user has chatted with
      const chats = await sequelize.query(`
        SELECT 
          CASE 
            WHEN m.sender_id = :userId THEN m.receiver_id
            ELSE m.sender_id
          END as other_user_id,
          MAX(m.created_at) as last_message_time,
          (
            SELECT message 
            FROM messages 
            WHERE (sender_id = :userId AND receiver_id = other_user_id)
               OR (sender_id = other_user_id AND receiver_id = :userId)
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_message,
          (
            SELECT COUNT(*) 
            FROM messages 
            WHERE receiver_id = :userId 
              AND sender_id = other_user_id 
              AND is_read = false
          ) as unread_count
        FROM messages m
        WHERE m.sender_id = :userId OR m.receiver_id = :userId
        GROUP BY other_user_id
        ORDER BY last_message_time DESC
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });
      
      // Get user details for each chat
      const chatList = await Promise.all(
        chats.map(async (chat) => {
          const otherUser = await UserModel.findByPk(chat.other_user_id, {
            attributes: ['id', 'email', 'full_name', 'role']
          });
          
          return {
            user: otherUser ? otherUser.toJSON() : null,
            last_message: chat.last_message,
            last_message_time: chat.last_message_time,
            unread_count: parseInt(chat.unread_count) || 0
          };
        })
      );
      
      console.log(`✅ [Sequelize] Found ${chatList.length} chat conversations`);
      
      return chatList.filter(chat => chat.user !== null);
    } catch (error) {
      console.error('❌ [Sequelize] Message.getUserChats() failed:', error.message);
      throw error;
    }
  }

  /**
   * Get unread message count for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} - Count of unread messages
   */
  static async getUnreadCount(userId) {
    console.log('🔷 [Sequelize] Message.getUnreadCount() called');
    console.log(`   User ID: ${userId}`);
    
    try {
      const count = await MessageModel.count({
        where: {
          receiver_id: userId,
          is_read: false
        }
      });
      
      console.log(`✅ [Sequelize] User has ${count} unread messages`);
      return count;
    } catch (error) {
      console.error('❌ [Sequelize] Message.getUnreadCount() failed:', error.message);
      throw error;
    }
  }

  /**
   * Delete a message (soft delete by marking as deleted)
   * @param {number} messageId - Message ID
   * @param {number} userId - User ID (must be sender)
   * @returns {Promise<boolean>} - True if deleted
   */
  static async deleteMessage(messageId, userId) {
    console.log('🔷 [Sequelize] Message.deleteMessage() called');
    console.log(`   Message ID: ${messageId}, User ID: ${userId}`);
    
    try {
      const message = await MessageModel.findByPk(messageId);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      // Only sender can delete
      if (message.sender_id !== userId) {
        throw new Error('Unauthorized: Only sender can delete message');
      }
      
      await message.destroy();
      
      console.log('✅ [Sequelize] Message deleted');
      return true;
    } catch (error) {
      console.error('❌ [Sequelize] Message.deleteMessage() failed:', error.message);
      throw error;
    }
  }

  /**
   * Search messages by content
   * @param {number} userId - User ID
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching messages
   */
  static async searchMessages(userId, searchTerm) {
    console.log('🔷 [Sequelize] Message.searchMessages() called');
    console.log(`   User ID: ${userId}, Search: ${searchTerm}`);
    
    try {
      const messages = await MessageModel.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId },
            { receiver_id: userId }
          ],
          message: {
            [Op.like]: `%${searchTerm}%`
          }
        },
        include: [
          {
            model: UserModel,
            as: 'sender',
            attributes: ['id', 'email', 'full_name', 'role']
          },
          {
            model: UserModel,
            as: 'receiver',
            attributes: ['id', 'email', 'full_name', 'role']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 50
      });
      
      console.log(`✅ [Sequelize] Found ${messages.length} matching messages`);
      
      return messages.map(msg => msg.toJSON());
    } catch (error) {
      console.error('❌ [Sequelize] Message.searchMessages() failed:', error.message);
      throw error;
    }
  }
}

module.exports = Message;
