"use client";
import { useState, useRef, useEffect } from "react";
import { Modal, Button, Card, Input, Row, Col, Space } from "antd";
import { IoMdMic, IoMdMicOff, IoMdVideocam } from "react-icons/io";
import { IoVideocamOff } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { useSigner } from "@thirdweb-dev/react";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";

const { Search } = Input;

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

  const handleAcceptIncomingCall = async () => {
    await pushUserVideo.current?.approve();
  };

  const handleRejectIncomingCall = async () => {
    await pushUserVideo.current?.deny();
  };

  return (
    <div>
      <Row justify="center" style={{ marginTop: "50px" }}>
        <Col span={8}>
          <Search
            placeholder="Enter Address or ENS name"
            onChange={(e) => setRecipientAddress(e.target.value)}
            enterButton="Call"
            size="large"
            onSearch={handleMakeCall}
          />
        </Col>
      </Row>
      <Card>
        <Row justify="center" style={{ marginTop: "50px" }}>
          <Col span={8}>
            <Card title="Your Video" style={{ textAlign: "center" }}>
              {/* Your video stream here */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                style={{ width: "100%" }}
              >
                {/* Add your video stream source here */}
              </video>
            </Card>
          </Col>
          {data?.incoming[0].status === CONSTANTS.VIDEO.STATUS.CONNECTED && (
            <Col span={8}>
              <Card title="Remote User's Video" style={{ textAlign: "center" }}>
                {/* Remote user's video stream here */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  style={{ width: "100%" }}
                />
              </Card>
            </Col>
          )}
        </Row>
        {/* actions buttons centered */}
        <Row
          justify="center"
          style={{
            textAlign: "center",
            marginTop: "50px"
          }}
        >
          <Col span={8}>
            <Space>
              <Button
                onClick={handleToggleVideo}
                icon={data?.local?.video ? <IoMdVideocam /> : <IoVideocamOff />}
              />
              <Button
                onClick={handleToggleAudio}
                icon={data?.local?.audio ? <IoMdMic /> : <IoMdMicOff />}
              />
              {/* show end call button only when remote data?.incoming[0]?.status */}
              {data?.incoming[0]?.status ===
                CONSTANTS.VIDEO.STATUS.CONNECTED && (
                <Button
                  onClick={handleEndCall}
                  icon={<MdCallEnd />}
                  danger
                  type="primary"
                />
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Incoming Call"
        open={data?.incoming[0]?.status === CONSTANTS.VIDEO.STATUS.RECEIVED}
        footer={[
          <Button
            style={{
              color: "white",
              backgroundColor: "#00FF00",
              borderColor: "#00FF00"
            }}
            key="accept"
            type="primary"
            icon={<IoCall />}
            onClick={handleAcceptIncomingCall}
          >
            Accept
          </Button>,
          <Button
            style={{
              color: "white",
              backgroundColor: "#FF0000",
              borderColor: "#FF0000"
            }}
            key="reject"
            icon={<MdCallEnd />}
            danger
            onClick={handleRejectIncomingCall}
          >
            Reject
          </Button>
        ]}
      >
        {data?.incoming[0]?.status === CONSTANTS.VIDEO.STATUS.RECEIVED &&
          recipientAddress && (
            <div>
              <p>{`${recipientAddress} is calling.`}</p>
            </div>
          )}
      </Modal>
    </div>
  );
}
