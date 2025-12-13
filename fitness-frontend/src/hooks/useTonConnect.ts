import { useEffect, useState } from 'react';
import { TonConnectUI } from '@tonconnect/ui';
import { UserRejectsError } from '@tonconnect/sdk';
import { beginCell } from '@ton/core';

export interface TonConnectState {
  connected: boolean;
  walletAddress: string | null;
  connecting: boolean;
  error: string | null;
}

export const useTonConnect = () => {
  const [state, setState] = useState<TonConnectState>({
    connected: false,
    walletAddress: null,
    connecting: false,
    error: null,
  });

  const [tonConnectUI, setTonConnectUI] = useState<TonConnectUI | null>(null);

  useEffect(() => {
    // Initialize TON Connect UI
    // Note: TypeScript template literal type issue - using type assertion
    const protocol = window.location.protocol;
    const host = window.location.host;
    const manifestUrl = `${protocol}//${host}/tonconnect-manifest.json`;
    
    const ui = new TonConnectUI({
      // @ts-ignore - TON Connect requires template literal type but we construct it dynamically
      manifestUrl,
      actionsConfiguration: {
        twaReturnUrl: window.location.href,
      },
    } as any);

    setTonConnectUI(ui);

    // Check if wallet is already connected via onStatusChange
    // Listen for connection status changes
    ui.onStatusChange((wallet) => {
      if (wallet) {
        setState({
          connected: true,
          walletAddress: wallet.account.address,
          connecting: false,
          error: null,
        });
      } else {
        setState({
          connected: false,
          walletAddress: null,
          connecting: false,
          error: null,
        });
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  const connectWallet = async () => {
    if (!tonConnectUI) {
      setState((prev) => ({ ...prev, error: 'TON Connect not initialized' }));
      return;
    }

    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      await tonConnectUI.openModal();
    } catch (error) {
      if (error instanceof UserRejectsError) {
        setState((prev) => ({
          ...prev,
          connecting: false,
          error: 'Connection cancelled by user',
        }));
      } else {
        setState((prev) => ({
          ...prev,
          connecting: false,
          error: error instanceof Error ? error.message : 'Failed to connect wallet',
        }));
      }
    }
  };

  const disconnectWallet = async () => {
    if (!tonConnectUI) {
      return;
    }

    try {
      await tonConnectUI.disconnect();
      setState({
        connected: false,
        walletAddress: null,
        connecting: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet',
      }));
    }
  };

  const sendTransaction = async (to: string, amount: string, comment?: string) => {
    if (!tonConnectUI || !state.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      // validUntil is required - set to 5 minutes from now
      const validUntil = Math.floor(Date.now() / 1000) + 300;
      
      // Build TON comment payload if comment is provided
      let payload: string | undefined;
      if (comment) {
        // Build TON comment cell properly using @ton/core
        const cell = beginCell()
          .storeUint(0, 32) // Text comment opcode (0)
          .storeStringTail(comment) // Comment text
          .endCell();
        
        // Convert cell to hex
        payload = cell.toBoc().toString('hex');
      }
      
      const transaction = {
        messages: [
          {
            address: to,
            amount: amount,
            ...(payload && { payload }), // Only include payload if comment exists
          },
        ],
        validUntil: validUntil,
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      return result;
    } catch (error) {
      if (error instanceof UserRejectsError) {
        throw new Error('Transaction rejected by user');
      }
      throw error;
    }
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    tonConnectUI,
  };
};

