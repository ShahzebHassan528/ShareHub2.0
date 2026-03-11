/**
 * Message Model - Sequelize Definition
 * 
 * Handles user-to-user messaging functionality
 * Integrated with existing User model
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Message cannot be empty'
        },
        len: {
          args: [1, 5000],
          msg: 'Message must be between 1 and 5000 characters'
        }
      }
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'messages',
    timestamps: false, // We're using custom created_at
    indexes: [
      {
        name: 'idx_sender_receiver',
        fields: ['sender_id', 'receiver_id']
      },
      {
        name: 'idx_receiver_unread',
        fields: ['receiver_id', 'is_read']
      },
      {
        name: 'idx_created_at',
        fields: ['created_at']
      }
    ]
  });

  // Define associations (will be called in index.js)
  Message.associate = (models) => {
    // Message belongs to sender (User)
    Message.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });

    // Message belongs to receiver (User)
    Message.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });
  };

  return Message;
};
