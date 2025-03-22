module.exports = (sequelize, DataTypes) => {
    const Loan = sequelize.define('Loan', {
        loanType: {
            type: DataTypes.ENUM('personal', 'home', 'car', 'education'),
            allowNull: false
        },
        loanAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        loanTenure: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        loanPurpose: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    return Loan;
};