import './Header.css'

export default function Header({ balance, month, isActive = true }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount)
    }

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-logo">
                    <div className="logo-icon">F</div>
                    <div className="logo-text">
                        <span className="logo-title">FATE. MANY MONTHS.</span>
                        <span className="logo-subtitle">Financial Literacy Simulator</span>
                    </div>
                </div>
            </div>

            <div className="header-center">
                <div className="status-indicator">
                    <span className="status-label">SIMULATION STATUS</span>
                    <span className={`status-value ${isActive ? 'active' : 'paused'}`}>
                        <span className="status-dot"></span>
                        {isActive ? 'ACTIVE' : 'PAUSED'}
                    </span>
                </div>
            </div>

            <div className="header-right">
                <div className="balance-display">
                    <span className="balance-label">BALANCE</span>
                    <span className="balance-value">{formatCurrency(balance)}</span>
                </div>
                <button className="header-icon-btn" aria-label="Settings">
                    ⚙️
                </button>
            </div>
        </header>
    )
}
