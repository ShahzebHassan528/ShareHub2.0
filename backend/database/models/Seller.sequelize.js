module.exports = (sequelize, DataTypes) => {
  const Seller = sequelize.define('Seller', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    business_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    business_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    business_license: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tax_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    approval_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    total_sales: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'sellers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['approval_status'] }
    ]
  });

  return Seller;
};
