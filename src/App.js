/* eslint-disable jsx-a11y/alt-text */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { createStore, createStyleSet } from 'botframework-webchat';
import bot from './assets/user1.jpg'
import user from './assets/user2.jpg'
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import WebChat from './WebChat';

import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';

function App() {
  // const contentList = [

  // ]

  // const [loaded, setLoaded] = useState(false);
  // const [minimized, setMinimized] = useState(true);
  const [contentList, setContentList] = useState([])
  const [loadMsg, setLoadMsg] = useState(false)
  const [sendText, setSendText] = useState('')
  const [newMessage, setNewMessage] = useState(false);
  const [selectChat, setSelectChat] = useState(0);
  // const [side, setSide] = useState('right');
  const [token, setToken] = useState('');

  useEffect(() => {

  }, [contentList]);

  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => next => action => {
        console.log(action)
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
              name: 'webchat/join',
              value: {
                language: window.navigator.language
              }
            }
          });
        } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          if (action.payload.activity.from.role === 'bot') {
            console.log(action.payload.activity.text)
            if (action.payload.activity.text[0] === '{') {
              const message = action.payload.activity.text[0] === '{' ? JSON.parse(action.payload.activity.text) : action.payload.activity.text
              contentList.push(message)

              const conversation = [...new Set(contentList.map(item => item.conversationId))].map(item => ({ conversationId: item, msg: [] }))

              contentList.forEach((item) => {
                const findId = conversation.findIndex((id) => id.conversationId === item.conversationId)
                conversation[findId].msg.push(item)
              })

              conversation.forEach((item) => {
                item.lastMsg = item.msg[item.msg.length - 1].text
              })
              console.log(conversation)
              setContentList(conversation)
              setLoadMsg(true)
            }
            setNewMessage(true);
          }
        }

        return next(action);
      }),
    []
  );

  const handleFetchToken = useCallback(async () => {
    if (!token) {
      const res = await fetch('https://5399-61-220-206-157.ngrok.io/api/admin/token', { method: 'GET' })
      console.log(res)
      const { token, conversationId } = await res.json();
      console.log(token)

      setToken(token);
    }
  }, [setToken, token]);

  const styleSet = useMemo(
    () =>
      createStyleSet({
        backgroundColor: 'Transparent'
      }),
    []
  );

  async function sendMsg(text) {
    const data = {
      user_id: 'dl_1234',
      conversation_id: contentList[selectChat].conversationId,//會話紀錄ID
      message: text //訊息
    }
    await fetch('https://5399-61-220-206-157.ngrok.io/api/notify', {
      method: 'POST', body: JSON.stringify({
        ...data
      })
    })
  }

  return (
    <div className='w-screen flex h-screen overflow-auto min-w-0'>
      {/* <div className='w-1/4 flex flex-col border'>
        {contentList.map((item) => (
          <div>
            
          </div>
        ))}
      </div> */}

      <Paper className='w-1/4'>
        <MenuList>
          {contentList.map((item, index) => (
            <MenuItem classes={{ root: 'h-16 gap-5' }} key={item.conversationId} onClick={() => { setSelectChat(index) }}>
              <Avatar alt="Remy Sharp" src={user} />
              <div className='w-40 flex flex-col justify-center'>
                <div className='text-lg font-semibold'>
                  User{index + 1}
                </div>

                <div className='text-base inline-block truncate'>
                  {item.lastMsg}
                </div>
              </div>
            </MenuItem>
          ))}
        </MenuList>
      </Paper>

      <div className='w-3/4 flex flex-col'>
        <Card className='h-24' style={{ borderRadius: 0 }}>
          <div className='flex items-center gap-5 p-4 text'>
            <img className="inline-block h-12 w-12 rounded-full ring-2 ring-white" src={user} />
            <div className='flex flex-col justify-center'>
              <div className='text-xl font-semibold'>
                User{selectChat + 1}
              </div>

              <div className='text-base'>
                2個小時前在線上
              </div>
            </div>
          </div>
        </Card>

        <div className='h-screen flex flex-col overflow-scroll overflow-x-hidden'>
          {loadMsg ? contentList[selectChat].msg.map((item, index) => {
            if (item.role === 'user') {
              return (
                <div className='flex items-center m-4 gap-5' key={index}>
                  <img className="inline-block h-16 w-16 rounded-full ring-2 ring-white" src={user} />
                  <div className='text-white bg-sky-600 p-4 rounded-lg max-w-sm break-words overflow-hidden'>
                    {item.text}
                  </div>
                </div>
              )
            }

            if (item.role === 'bot') {
              return (
                <div className='flex justify-end items-center m-4 gap-5' key={index}>
                  <img className="inline-block h-16 w-16 rounded-full ring-2 ring-white order-2" src={bot} />
                  <div className='text-gray-900 bg-slate-200 p-4 rounded-lg max-w-sm break-words overflow-hidden relative'>
                    {item.text}
                  </div>
                </div>
              )
            }

            return ''
          }) : ''
          }
        </div>

        <Card>
          <div className='flex items-center gap-2 p-4'>
            <TextField
              classes={{ root: 'bg-gray-200' }}
              value={sendText}
              multiline
              fullWidth
              size="small"
              maxRows={3}
              label="Aa"
              onChange={(e) => { setSendText(e.target.value) }}
            />

            <IconButton size="large" onClick={() => { sendMsg(sendText); setSendText('') }}>
              <SendRoundedIcon fontSize="inherit" />
            </IconButton>
          </div>
        </Card>
      </div>
      <div className='hidden'>
        <WebChat
          className="react-web-chat"
          onFetchToken={handleFetchToken}
          store={store}
          styleSet={styleSet}
          token={token}
        />
      </div>
    </div>
  )
}

export default App

