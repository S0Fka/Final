// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Контракт для оплаты счетов
contract BillPayment {

    // State Variables
    address public immutable owner;
    string public greeting = "Bill Payment Contract!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint) public userGreetingCounter;
    
    // Маппинг для хранения счетов
    struct Bill {
        uint256 amount;
        uint256 dueDate;
        bool paid;
    }

    // Маппинг адресов пользователей на их счета
    mapping(address => Bill[]) public userBills;

    // Событие для изменения состояния
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);
    event BillCreated(address indexed user, uint256 billIndex, uint256 amount, uint256 dueDate);
    event BillPaid(address indexed user, uint256 billIndex, uint256 amountPaid);

    // Конструктор для инициализации владельца
    constructor(address _owner) {
        owner = _owner;
    }

    // Модификатор, который проверяет, что функцию вызывает только владелец
    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    // Функция для изменения приветствия и отслеживания счета
    function setGreeting(string memory _newGreeting) public payable {
        console.log("Setting new greeting '%s' from %s", _newGreeting, msg.sender);
        
        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
    }

    // Функция для создания счета
    function createBill(uint256 _amount, uint256 _dueDate) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(_dueDate > block.timestamp, "Due date must be in the future");

        // Добавляем новый счет пользователю
        userBills[msg.sender].push(Bill({
            amount: _amount,
            dueDate: _dueDate,
            paid: false
        }));

        emit BillCreated(msg.sender, userBills[msg.sender].length - 1, _amount, _dueDate);
    }

    // Функция для оплаты счета
    function payBill(uint256 _billIndex) public payable {
        Bill storage bill = userBills[msg.sender][_billIndex];
        require(bill.dueDate > block.timestamp, "Bill is overdue");
        require(!bill.paid, "Bill already paid");
        require(msg.value >= bill.amount, "Insufficient payment amount");

        // Отметим счет как оплаченный
        bill.paid = true;

        // Передаем оплату владельцу контракта
        (bool success, ) = owner.call{ value: msg.value }("");
        require(success, "Payment failed");

        emit BillPaid(msg.sender, _billIndex, msg.value);
    }

    // Функция для получения всех счетов пользователя
    function getUserBills(address _user) public view returns (Bill[] memory) {
        return userBills[_user];
    }

    // Функция, позволяющая владельцу вывести средства из контракта
    function withdraw() public isOwner {
        (bool success, ) = owner.call{ value: address(this).balance }("");
        require(success, "Failed to send Ether");
    }

    receive() external payable {}
}
