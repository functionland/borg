import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Borg, createClient } from '@functionland/fula'
import TodoList from './components/TodoList';
import { BorgProvider } from '@functionland/fula-client-react'

function App() {
  const inputRef = useRef<any>(null);
  const [fulaClient, setBorgClient] = useState<Borg>();
  const [connecting, setConnecting] = useState(false);
  const [serverId, setServerId] = useState("")
  const [connectionStaus, setConnectionStaus] = useState(false)

  const startBorg = async () => {
    const fulaClient = await createClient();
    const node = fulaClient.getNode()

    node.connectionManager.on('peer:connect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
      setServerId(srvId=>{
        if (connection.remotePeer.toB58String() === srvId)
        setTimeout(() => {
          setConnectionStaus(true)
        }, 100);
        localStorage.setItem("serverId",srvId||"")
        return srvId;
      })
     
      console.log(`Connected to ${connection.remotePeer.toB58String()}`);
    });
    node.connectionManager.on('peer:disconnect', async (connection: { remotePeer: { toB58String: () => any; }; }) => {
      if (connection.remotePeer.toB58String() === serverId)
        setConnectionStaus(false);
      console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
    });
    node.on('peer:discovery', async (peerId: { toB58String: () => any; }) => {
      // console.log(`Found peer ${peerId.toB58String()}`);
      // setOutput(output + `${`Found peer ${peerId.toB58String()}`.trim()}\n`)
    });
    setBorgClient(fulaClient);
  }
  const connect = async () => {
    console.log("connecting to fula...!")
    try {
      setConnecting(true);
      if (!fulaClient) {
        console.log("fula is not mounted!")
        return
      }
      if (await fulaClient.connect(serverId))
        console.log("fula is connected!")
      else
        console.log(`fula unable to connect!`)
    } catch (e) {
      console.log(`connect error`, e)
    } finally {
      setConnecting(false);
    }
  }
  useEffect(() => {
    startBorg();
    setServerId(localStorage.getItem("serverId")||"");
    inputRef?.current?.focus();
  }, []);

  useEffect(() => {
    if(serverId)
      connect()
  }, [fulaClient]);
  const handleChange = (e: any) => {
    setServerId(e.target.value);
  };
  const handleConnect = (e: any) => {
    e.preventDefault();
    setConnecting(prev => {
      if (!prev) {
        connect();
        return !prev
      }
      return prev;
    })

  };
  return (
    <div className='todo-app'>
      <BorgProvider fula={fulaClient}>
        {connectionStaus ? <TodoList /> : <div className='connect-container'>
          <div className='app-header'>
            {!connecting ? <h1>Connect to BOX!</h1> : null}
            {connecting ? <div className='lds-ellipsis'><div></div><div></div><div></div><div></div></div> : null}
          </div>
          <input
            placeholder='Enter your server Id'
            value={serverId}
            onChange={handleChange}
            name='text'
            ref={inputRef}
            className='todo-input'
          />
          <button disabled={!fulaClient} onClick={handleConnect} className='todo-button'>
            Connect
          </button>

        </div>}
      </BorgProvider>
    </div>
  );
}

export default App;