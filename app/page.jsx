"use client";
import { useState } from "react";
import { Modal, Button, Card, Input, Row, Col, Space } from "antd";
import {
  IoMdMic,
  IoMdMicOff,
  IoMdVideocam,
  IoMdVideocamOff
} from "react-icons/io";
import { MdCallEnd } from "react-icons/md";
import { IoCall } from "react-icons/io5";

const { Search } = Input;

const PushTime = () => {
  const [isCallModalVisible, setIsCallModalVisible] = useState(true);
  const [isCallIncoming, setIsCallIncoming] = useState(true);
  const [remoteUser, setRemoteUser] = useState("0x73...99789739");
  const [remoteStream, setRemoteStream] = useState("sdfds");

  // Function to handle incoming call
  const handleIncomingCall = (remoteUserInfo) => {
    setIsCallIncoming(true);
    setRemoteUser(remoteUserInfo);
  };

  // Function to accept the call
  const acceptCall = () => {
    // Add your logic to handle the call acceptance
    setIsCallModalVisible(false);
  };

  // Function to reject the call
  const rejectCall = () => {
    // Add your logic to handle the call rejection
    setIsCallModalVisible(false);
    setIsCallIncoming(false);
    setRemoteUser(null);
    setRemoteStream(null);
  };

  // Function to make a call
  const makeCall = (addressOrENS) => {
    // Add your logic to make a call
  };

  return (
    <div>
      <Row justify="center" style={{ marginTop: "50px" }}>
        <Col span={8}>
          <Search
            placeholder="Enter Address or ENS name"
            enterButton="Call"
            size="large"
            onSearch={(value) => makeCall(value)}
          />
        </Col>
      </Row>
      <Card>
        <Row justify="center" style={{ marginTop: "50px" }}>
          <Col span={8}>
            <Card title="Your Video" style={{ textAlign: "center" }}>
              {/* Your video stream here */}
              <video autoPlay muted style={{ width: "100%" }}>
                {/* Add your video stream source here */}
              </video>
            </Card>
          </Col>
          {remoteStream && (
            <Col span={8}>
              <Card title="Remote User's Video" style={{ textAlign: "center" }}>
                {/* Remote user's video stream here */}
                <video autoPlay style={{ width: "100%" }}>
                  <source src={remoteStream} type="video/mp4" />
                </video>
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
              <Button icon={<IoMdMic />} />
              <Button icon={<IoMdVideocam />} />
              <Button icon={<MdCallEnd />} />
            </Space>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Incoming Call"
        open={isCallModalVisible}
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
            onClick={acceptCall}
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
            onClick={rejectCall}
          >
            Reject
          </Button>
        ]}
      >
        {isCallIncoming && remoteUser && (
          <div>
            <p>{`${remoteUser} is calling.`}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PushTime;
