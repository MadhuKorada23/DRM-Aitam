
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
// import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button, Form, Card, Row, Col, Container } from "react-bootstrap";
// import * as XLSX from "xlsx";


const Loader = ({ text = "Loading...", centered = true }) => {
  return (
    <div className={`d-flex ${centered ? "justify-content-center" : ""} align-items-center my-3`}>
      <div className="spinner-border text-primary me-2" role="status" />
      <span className="fs-5">{text}</span>
    </div>
  );
};

const Floorpage = () => {
  const navigate = useNavigate();
  const { blockname } = useParams();
  const [block, setBlock] = useState(() => {
  try {
    const savedBlock = localStorage.getItem("block");
    return savedBlock ? JSON.parse(savedBlock) : null;
  } catch (err) {
    console.error("Invalid JSON in localStorage for 'block':", err);
    localStorage.removeItem("block"); // Optional: clear corrupted value
    return null;
  }
});


  // const [block, setBlock] = useState(() => JSON.parse(localStorage.getItem("block")) || null);
  const [floorid, setFloorid] = useState(null);
  const [floorName, setFloorName] = useState("");
  const [roomdata, setRoomData] = useState([]);
  // const [roomSearch, setRoomSearch] = useState("");
  const [dept, setdept] = useState("");
  const [err, setErr] = useState("");
  const [access, setaccess] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [loading,setLoading] = useState(false)
  




  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        setLoading(true)
        const decode = jwtDecode(token);
        setaccess(decode.role);
        setdept(decode.dept);
      } catch (error) {
        console.error("Invalid token");
        navigate("/login");
      }finally{
        setLoading(false)
      }
    }


    const fetchBlockData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`https://dr-backend-32ec.onrender.com/block/get-data-name/${blockname}`);
        setBlock(response.data);
        localStorage.setItem("block", JSON.stringify(response.data));
      } catch (error) {
        setErr("Failed to fetch updated block data");
        console.error(error);
      }finally{
        setLoading(false)
      }
    };


    if (blockname) fetchBlockData();
 
    

  }, [blockname,roomdata]);







 





  const handleAddFloor = async (e) => {
    e.preventDefault();
    if (!floorName.trim()) {
      alert("Please enter the floor name");
      return;
    }
    try {
      await axios.post(`https://dr-backend-32ec.onrender.com/block/floor/${block?._id}`, { floor_name: floorName });
      setFloorName("");
      const response = await axios.get(`https://dr-backend-32ec.onrender.com/block/get-data/${block?._id}`);
      setBlock(response.data);
    } catch (error) {
      alert("Failed to add floor");
    }
  };



  const handleConfirmDelete = async () => {
    setShowDialog(false);
    try {
      if (!block || !floorid) return;


      if (dialogType === "floor") {
        await axios.delete(`https://dr-backend-32ec.onrender.com/block/${block._id}/floor/${floorid._id}`);
        setFloorid(null);
      } else if (dialogType === "room" && selectedRoom) {
        await axios.delete(`https://dr-backend-32ec.onrender.com/block/${block._id}/floor/${floorid._id}/room/${selectedRoom._id}`);
      }


      const updatedData = await axios.get(`https://dr-backend-32ec.onrender.com/block/get-data/${block._id}`);
      localStorage.setItem("block", JSON.stringify(updatedData.data));
      setBlock(updatedData.data);
      setRoomData(updatedData.data.floors.find((f) => f._id === floorid?._id)?.rooms || []);


      toast.success(dialogType === "floor" ? "Floor deleted" : `Room '${selectedRoom.room_name}' deleted`);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };




  const backtohome = () => {
    navigate(`/`)
    sessionStorage.removeItem("selectedFloor")
  };


  const canEdit = (access === "super_admin") || (access !== "student" && dept.toLowerCase() === block?.block_name?.toLowerCase());

  const handleFloorClick = (floor) => {
    navigate(`/aitam/${blockname}/${floor._id}/rooms`);
  };


  return (
    <Container fluid className="p-4 fs-6">
      <ToastContainer />
      <Modal show={showDialog} onHide={() => setShowDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete - {dialogType === "floor" ? `Floor: "${floorid?.floor_name || ''}"` : `Room: "${selectedRoom?.room_name || ''}"`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      
        <>
              {/* Fixed Top Navbar-like Header */}
              <div
                className="container-fluid px-0 position-fixed top-0 start-0 w-100 shadow-sm"
                style={{
                  zIndex: 1050,
                  background: 'linear-gradient(90deg, #3767cfff 0%, #2575fc 100%)',
                  borderBottom: '3px solid #0047ab',
                  color: 'white',
                }}
              >
                <div className="container px-3 py-3">
                  <Row className="align-items-center justify-content-between">
                    {/* Title */}
                    <Col xs={12} md="auto" className="mb-2 mb-md-0 text-center text-md-start">
                      <h5 className="m-0 fw-bold">
                        Floor Page for Block: <span className="text-light">{block?.block_name}</span>
                      </h5>
                      {err && <p className="text-warning mt-2">{err}</p>}
                    </Col>

                    {/* Buttons */}
                    <Col xs={12} md="auto" className="text-center text-md-end">
                      {(access!="student") &&
                        <>
                          <Button
                            variant="light"
                            className="me-2 fw-semibold"
                            onClick={() => navigate(`/${blockname}/showtimetable`)}
                          >
                          Show Timetable
                          </Button>
                        </>
                      }
                      <Button variant="outline-light" className="fw-semibold" onClick={backtohome}>
                        Back to Home
                      </Button>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Content Section with top spacing */}
              <div style={{ marginTop: '100px' }}>
                {loading ? (
                  <Loader /> // Show loader when loading is true
                ) : (
                  !floorid && (
                    <>
                      {canEdit && (
                        <Row className="justify-content-center my-4">
                          <Col xs="auto">
                            <Form.Control
                              type="text"
                              placeholder="Enter floor name"
                              value={floorName}
                              onChange={(e) => setFloorName(e.target.value)}
                            />
                          </Col>
                          <Col xs="auto">
                            <Button variant="primary" onClick={handleAddFloor}>
                              Add Floor
                            </Button>
                          </Col>
                        </Row>
                      )}

                      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {block?.floors?.map((floor, index) => (
                          <Col key={index}>
                            <Card
                              className="text-center border-0 shadow rounded-4 bg-primary-subtle h-100"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleFloorClick(floor)}
                            >
                              <Card.Body>
                                <Card.Title className="fs-6 text-primary fw-bold">
                                  {floor.floor_name}
                                </Card.Title>
                                <Card.Text className="text-muted">
                                  {floor.rooms.length} Rooms
                                </Card.Text>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </>
                  )
                )}
              </div>

        </>

    </Container>
  );
};


export default Floorpage;





