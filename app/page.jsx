"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Input, Card, Row, Col } from "antd";
import {
  VideoCameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import { useSigner } from "@thirdweb-dev/react";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";

export default function Home() {
  const [data, setData] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const pushUserVideo = useRef(null);
  const signer = useSigner();

  useEffect(() => {
    const init = async () => {
      if (!signer) return;

      const pushUser = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.STAGING
      });
      const stream = await pushUser.initStream([CONSTANTS.STREAM.VIDEO]);
      pushUserVideo.current = await pushUser.video.initialize(setData, {
        stream: stream,
        config: {
          video: true,
          audio: true
        }
      });

      stream.on(CONSTANTS.STREAM.VIDEO, (data) => {
        console.log(data);
        if (data.event === CONSTANTS.VIDEO.EVENT.REQUEST) {
          console.log("Call request received");
        }

        if (data.event === CONSTANTS.VIDEO.EVENT.APPROVE) {
          console.log("Call approved");
        }

        if (data.event === CONSTANTS.VIDEO.EVENT.DENY) {
          console.log("Call denied");
        }

        if (data.event === CONSTANTS.VIDEO.EVENT.CONNECT) {
          console.log("Call connected");
        }

        if (data.event === CONSTANTS.VIDEO.EVENT.DISCONNECT) {
          console.log("Call disconnected");
        }
      });

      stream.connect();
    };

    init();
  }, [signer]);

  const handleMakeCall = async () => {
    await pushUserVideo.current.request([recipientAddress]);
  };

  const handleEndCall = async () => {
    await pushUserVideo.current.disconnect();
  };

  const handleToggleAudio = async () => {
    pushUserVideo.current?.config({ audio: !data?.local.audio });
  };

  const handleToggleVideo = async () => {
    pushUserVideo.current?.config({ video: !data?.local.video });
  };

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && data?.local?.stream) {
      localVideoRef.current.srcObject = data.local.stream;
    }

    if (remoteVideoRef.current && data?.incoming[0]?.stream) {
      remoteVideoRef.current.srcObject = data.incoming[0].stream;
    }
  }, [data]);

  return (
    <main>
      <h1>Welcome to Push Communities</h1>
      <p>A place to connect with your Web3 friends and family.</p>
      <div className="input-button-container">
        <Input
          placeholder="Enter wallet address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          style={{ marginRight: "10px", width: "200px" }}
        />
        <Button type="primary" onClick={handleMakeCall}>
          Call
        </Button>
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card
            title="Your Video"
            actions={[
              <Button
                key="video-toggle"
                onClick={handleToggleVideo}
                icon={
                  data?.local?.video ? (
                    <VideoCameraOutlined />
                  ) : (
                    <VideoCameraOutlined />
                  )
                }
              />,
              <Button
                key="audio-toggle"
                onClick={handleToggleAudio}
                icon={
                  data?.local?.audio ? (
                    <AudioOutlined />
                  ) : (
                    <AudioMutedOutlined />
                  )
                }
              />
            ]}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "100%", height: "100%" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          {data?.incoming[0]?.status === CONSTANTS.VIDEO.STATUS.CONNECTED && (
            <Card title="Incoming Video">
              <video
                poster="https://via.placeholder.com/300"
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%" }}
              />
            </Card>
          )}
        </Col>
      </Row>
    </main>
  );
}
