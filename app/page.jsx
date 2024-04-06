"use client";
import { useState, useRef, useEffect } from "react";
import {
  Modal,
  Button,
  Card,
  Input,
  Row,
  Col,
  Space,
  message,
  Form
} from "antd";
import { IoMdMic, IoMdMicOff, IoMdVideocam } from "react-icons/io";
import { IoVideocamOff } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { useSigner, useAddress } from "@thirdweb-dev/react";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { getDefaultProvider } from "@ethersproject/providers";
import { isAddress } from "@ethersproject/address";
import styles from "./page.module.css";

const provider = getDefaultProvider(process.env.NEXT_PUBLIC_MAINNET_RPC_URL);

const addressToEns = async (address) => {
  try {
    return await provider.lookupAddress(address);
  } catch (err) {
    console.log("Error lookup address", err);
    return address;
  }
};

const ensToAddress = async (name) => {
  try {
    return await provider.resolveName(name);
  } catch (err) {
    console.log("Error resolving ens", err);
    return name;
  }
};

export default function Home() {
  const [data, setData] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [incomingCaller, setIncomingCaller] = useState(null);
  const [loading, setLoading] = useState({});
  const pushUserVideo = useRef(null);

  const signer = useSigner();
  const account = useAddress();

  const incomingStatus = data?.incoming[0]?.status;

  const init = async () => {
    console.log("init is calling", signer, data);
    if (!signer) return message.error("Please connect your wallet");
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

    stream.on(CONSTANTS.STREAM.VIDEO, async (data) => {
      console.log(data);
      if (data.event === CONSTANTS.VIDEO.EVENT.REQUEST) {
        console.log("Call request received");
        console.log("data on request", data);
        const callerEnsish = await addressToEns(data?.peerInfo?.address);
        console.log("Caller ENSish", callerEnsish);
        setIncomingCaller(callerEnsish || data?.peerInfo?.address);
      }

      if (data.event === CONSTANTS.VIDEO.EVENT.APPROVE) {
        console.log("Call approved");
        message.success("Call connected");
        console.log("data on approve", data);
      }

      if (data.event === CONSTANTS.VIDEO.EVENT.DENY) {
        console.log("Call denied");
        message.error("Call denied");
        console.log("data on deny", data);
      }

      if (data.event === CONSTANTS.VIDEO.EVENT.CONNECT) {
        console.log("Call connected");
        message.success("Call connected");
        console.log("data on connect2", data);
      }

      if (data.event === CONSTANTS.VIDEO.EVENT.DISCONNECT) {
        console.log("Call disconnected");
        message.success("Call disconnected");
        console.log("data on disconnect2", data);
      }
    });

    stream.connect();
  };

  useEffect(() => {
    console.log(signer, data);
    if (!signer) return;
    // initialize the video stream when the video call is not initialized, call ended or denied.
    // only call init when signer is available and video call is not initialized or call ended or denied.
    if (!data || incomingStatus === CONSTANTS.VIDEO.STATUS.UNINITIALIZED) {
      init();
    }
  }, [signer, incomingStatus]);

  const handleMakeCall = async () => {
    // check if address or ens name is valid
    if (!recipientAddress)
      return message.error("Please enter address or ENS name");
    setLoading({ makeCall: true });
    try {
      const recipientResolvedAddress = await ensToAddress(recipientAddress);
      if (!isAddress(recipientResolvedAddress)) {
        console.log("Invalid address");
        message.error("Invalid address or ENS name");
        return;
      }

      await pushUserVideo.current.request([recipientResolvedAddress]);
      message.success("Video call request sent. Waiting for response..");
    } catch (err) {
      message.error("Something went wrong!. Please try again.");
      console.log("Error making call", err);
    } finally {
      setLoading({ makeCall: false });
    }
  };

  const handleEndCall = async () => {
    setLoading({ endCall: true });
    try {
      await pushUserVideo.current.disconnect();
    } catch (err) {
      message.error("Something went wrong!. Please try again.");
      console.log("Error ending call", err);
    } finally {
      setLoading({ endCall: false });
    }
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
    setLoading({ acceptIncomingCall: true });
    try {
      await pushUserVideo.current?.approve();
    } catch (err) {
      message.error("Something went wrong!. Please try again.");
      console.log("Error accepting call", err);
    } finally {
      setLoading({ acceptIncomingCall: false });
    }
  };

  const handleRejectIncomingCall = async () => {
    setLoading({ rejectIncomingCall: true });
    try {
      await pushUserVideo.current?.deny();
    } catch (err) {
      message.error("Something went wrong!. Please try again.");
      console.log("Error rejecting call", err);
    } finally {
      setLoading({ rejectIncomingCall: false });
    }
  };

  return (
    <div>
      {account ? (
        <>
          <h2 style={{ textAlign: "center", marginTop: "20px" }}>
            Ready to make a call?
          </h2>
          <Form
            onFinish={handleMakeCall}
            style={{
              textAlign: "center",
              marginTop: "10px",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Form.Item
              name="address"
              hasFeedback
              rules={[
                {
                  validator: async (_, address) => {
                    const resolvedAddress = await ensToAddress(address);
                    if (!isAddress(resolvedAddress)) {
                      throw new Error("Invalid address or ENS name");
                    }
                  }
                }
              ]}
            >
              <Space>
                <Input
                  size="large"
                  placeholder="Enter Address or ENS name"
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  required
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  shape="round"
                  size="large"
                  icon={<IoCall />}
                  loading={loading?.makeCall}
                >
                  {loading.makeCall ? "Calling..." : "Call"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
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
                  />
                </Card>
              </Col>
              {incomingStatus === CONSTANTS.VIDEO.STATUS.CONNECTED && (
                <Col span={8}>
                  <Card
                    title="Remote User's Video"
                    style={{ textAlign: "center" }}
                  >
                    {/* Remote user's video stream here */}
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      style={{ width: "100%" }}
                    />
                    {/* add video, audio icons based on remote user's settings */}
                    <Space>
                      <Button
                        type="text"
                        style={{
                          color: data?.incoming[0]?.video ? "green" : "red"
                        }}
                        icon={
                          data?.incoming[0]?.video ? (
                            <IoMdVideocam />
                          ) : (
                            <IoVideocamOff />
                          )
                        }
                      />
                      <Button
                        type="text"
                        style={{
                          color: data?.incoming[0]?.audio ? "green" : "red"
                        }}
                        icon={
                          data?.incoming[0]?.audio ? (
                            <IoMdMic />
                          ) : (
                            <IoMdMicOff />
                          )
                        }
                      />
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
            {/* actions buttons centered */}
            <Row
              justify="center"
              style={{
                textAlign: "center",
                marginTop: "10px"
              }}
            >
              <Col span={8}>
                <Space>
                  <Button
                    style={{ color: data?.local?.video ? "green" : "red" }}
                    onClick={handleToggleVideo}
                    icon={
                      data?.local?.video ? <IoMdVideocam /> : <IoVideocamOff />
                    }
                  />
                  <Button
                    style={{ color: data?.local?.audio ? "green" : "red" }}
                    onClick={handleToggleAudio}
                    icon={data?.local?.audio ? <IoMdMic /> : <IoMdMicOff />}
                  />
                  {/* show end call button only when remote incomingStatus */}
                  {incomingStatus === CONSTANTS.VIDEO.STATUS.CONNECTED && (
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
            open={
              incomingStatus === CONSTANTS.VIDEO.STATUS.RECEIVED &&
              incomingCaller
            }
            footer={[
              <Button
                style={{
                  color: "white",
                  backgroundColor: "#00FF00",
                  borderColor: "#00FF00"
                }}
                key="accept"
                type="primary"
                loading={loading?.acceptIncomingCall}
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
                loading={loading.rejectIncomingCall}
                onClick={handleRejectIncomingCall}
              >
                Reject
              </Button>
            ]}
          >
            <p>{`${incomingCaller} is calling..`}</p>
          </Modal>
        </>
      ) : (
        // add landing page content here
        <div className={styles.heroSection}>
          <h1>
            Welcome to{" "}
            <p
              style={{
                color: "blue",
                display: "inline",
                fontWeight: "bold",
                fontSize: "1.5em"
              }}
            >
              PushTime
            </p>
          </h1>
          <h2>
            PushTime is a decentralized video calling application built with
            Push Protocol. A place to connect with your Web3 friends and family.
          </h2>
          <h2>Please connect your wallet to get started!</h2>
        </div>
      )}
    </div>
  );
}
