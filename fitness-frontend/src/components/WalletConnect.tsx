import React from 'react';
import { useTonConnect } from '../hooks/useTonConnect';
import { getColorScheme } from '../utils/colors';

interface WalletConnectProps {
  themeParams?: any;
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  themeParams, 
  onConnect, 
  onDisconnect 
}) => {
  const { 
    connected, 
    walletAddress, 
    connecting, 
    error, 
    connectWallet, 
    disconnectWallet 
  } = useTonConnect();

  const colorScheme = getColorScheme(themeParams);
  const buttonColor = colorScheme.button;
  const buttonTextColor = colorScheme.buttonText;
  const textColor = colorScheme.text;
  const mutedColor = colorScheme.muted;

  const handleConnect = async () => {
    await connectWallet();
    if (walletAddress && onConnect) {
      onConnect(walletAddress);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (connected && walletAddress) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        borderRadius: '12px',
        border: `1px solid ${mutedColor}`,
        backgroundColor: colorScheme.light,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              color: mutedColor,
              marginBottom: '4px',
            }}>
              Wallet Connected
            </div>
            <div style={{
              fontSize: '14px',
              fontFamily: 'monospace',
              color: textColor,
              fontWeight: '500',
            }}>
              {formatAddress(walletAddress)}
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <button
        onClick={handleConnect}
        disabled={connecting}
        style={{
          padding: '12px 24px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: buttonColor,
          color: buttonTextColor,
          fontSize: '16px',
          fontWeight: '600',
          cursor: connecting ? 'not-allowed' : 'pointer',
          opacity: connecting ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!connecting) {
            e.currentTarget.style.opacity = '0.9';
          }
        }}
        onMouseLeave={(e) => {
          if (!connecting) {
            e.currentTarget.style.opacity = '1';
          }
        }}
      >
        {connecting ? 'Connecting...' : 'Connect TON Wallet'}
      </button>
      
      {error && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

