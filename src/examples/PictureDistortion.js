import { provideFluentDesignSystem, fluentDataGrid, fluentDataGridCell, fluentDataGridRow } from '@fluentui/web-components';
import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import {Table, Input, Button} from 'antd';
import { create, all } from 'mathjs'
import React from 'react';
import './PictureDistortion.css'

const { wrap } = provideReactWrapper(React, provideFluentDesignSystem());
const { TextArea } = Input;
const config = { }
const math = create(all, config)

export const FluentDataGrid = wrap(fluentDataGrid());
export const FluentDataGridRow = wrap(fluentDataGridRow());
export const FuentDataGridCell = wrap(fluentDataGridCell());

export default class PictureDistortion extends React.Component {
  constructor(props) {
    super(props);
    this.originImgCanvasRef = React.createRef();
    this.originImgCanvasContext = null;
    this.zoomCanvasRef = React.createRef();
    this.zoomCanvasContext = null;
    this.distortedCanvasRef = React.createRef();
    this.distortedCanvasContext = null;
    this.img = null;

    this.targetImage = HTMLElement | undefined | null;
    this.state = {
      selectedImage: null,
      pixelXLoc: 0,
      pixelYLoc: 0,
      originImgCanvasWidth: 0,
      originImgCanvasHeight: 0,
      chosenPoints: 4,
      chosenPixels: [
        {
          name: "point0",
          x: 394,
          y: 252
        },
        {
          name: "point1",
          x: 520,
          y: 253
        },
        {
          name: "point2",
          x: 398,
          y: 360
        },
        {
          name: "point3",
          x: 524,
          y: 351
        }
      ],
      worldxy: "300,250\n425,250\n300,350\n425,350",
      worldCoordinates: [
        {x: 300, y:250}, {x: 425, y: 250}, {x: 300, y:350}, {x: 425, y:350}
      ]
    }
  }

  handleChange = event => {
    this.img = new Image();
    var objectUrl = URL.createObjectURL(event.target.files[0]);
    this.img.onload = () => {this.setState(
      {
        selectedImage: event.target.files[0],
        originImgCanvasWidth: this.img.width,
        originImgCanvasHeight: this.img.height
      },
      () => {
        let canvas = this.originImgCanvasRef.current;
        this.originImgCanvasContext = canvas.getContext('2d');
        this.originImgCanvasContext.drawImage(this.img, 0, 0, this.img.width, this.img.height);
        this.drawPoints()
        }
      );
    };
    this.img.src = objectUrl;
  };

  componentDidMount() {
    let canvas = this.zoomCanvasRef.current;
    this.zoomCanvasContext = canvas.getContext('2d');

    canvas = this.distortedCanvasRef.current;
    this.distortedCanvasContext = canvas.getContext('2d');
  }

  handleMouseMoveEvent = (e) => {
    let offsetX = e.nativeEvent.offsetX;
    let offsetY = e.nativeEvent.offsetY;

    this.setState(
      {
        pixelXLoc: e.nativeEvent.offsetX,
        pixelYLoc: e.nativeEvent.offsetY
      },
      () => {
        this.zoomCanvasContext.fillStyle = "white";
        this.zoomCanvasContext.fillRect(0, 0, 200, 200);
        this.zoomCanvasContext.drawImage(this.img,
          (offsetX - 50 > 0 ? offsetX - 50 : 0),
          (offsetY - 100 > 0 ? offsetY - 50 : 0),
          100, 100, 
          2 * (offsetX - 50 > 0 ? 0 : 50-offsetX),
          2 * (offsetY - 50 > 0 ? 0 : 50-offsetY),
          200, 200);
        this.zoomCanvasContext.fillStyle = "black";
        this.zoomCanvasContext.fillText("X: " + this.state.pixelXLoc + ", Y: " + this.state.pixelYLoc, 10, 10)
        this.zoomCanvasContext.beginPath();
        this.zoomCanvasContext.moveTo(100, 50); // Move the pen to (30, 50)
        this.zoomCanvasContext.lineTo(100, 150); // Draw a line to (150, 100)
        this.zoomCanvasContext.stroke(); //
        this.zoomCanvasContext.beginPath();
        this.zoomCanvasContext.moveTo(50, 100); // Move the pen to (30, 50)
        this.zoomCanvasContext.lineTo(150, 100); // Draw a line to (150, 100)
        this.zoomCanvasContext.stroke(); //
      }
    )
  }

  handleMouseLeave = (e) => {
    this.zoomCanvasContext.clearRect(0, 0, 400, 400);
  }

  handleMouseClick = (e) => {
    if (this.state.chosenPoints < 4) {
      this.setState(
        {
          chosenPoints: this.state.chosenPoints + 1,
          chosenPixels: [...this.state.chosenPixels, {name: "point" + this.state.chosenPoints, x: this.state.pixelXLoc, y: this.state.pixelYLoc }]
        },
        () => {
          this.drawPoints()
        }
      )
    }
  }

  drawPoints() {
    this.state.chosenPixels.map(
      (point) => {
        this.originImgCanvasContext.beginPath();
        this.originImgCanvasContext.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        this.originImgCanvasContext.fill();
        this.originImgCanvasContext.fillText(point.name, point.x - 10, point.y - 10)
      }
    )
  }

  clear() {
    this.originImgCanvasContext.clearRect(0, 0, this.state.originImgCanvasWidth, this.state.originImgCanvasHeight);
    this.zoomCanvasContext.clearRect(0, 0, 400, 400);
    this.setState(
      {
        selectedImage: null,
        chosenPixels: [],
        chosenPoints: 0,
        originImgCanvasWidth: 0,
        originImgCanvasHeight: 0,
        worldxy: "",
        worldCoordinates: ""
      }
    )
  }

  clearPoints() {
    this.setState(
      {
        chosenPixels: [],
        chosenPoints: 0,
        worldxy: "",
        worldCoordinates: ""
      }
    )
    this.originImgCanvasContext.drawImage(this.img, 0, 0, this.img.width, this.img.height);
  }

  remove_distortion() {
    var A = []
    var b = []
    var H = []
    var H_inv = []
    for (var i=0; i<4; i++) {
      // image point
      let ip = this.state.chosenPixels[i]
      // world point
      let wp = this.state.worldCoordinates[i]
      A = [...A, [ip.x, ip.y, 1, 0, 0, 0, -ip.x*wp.x, -ip.y*wp.x]]
      b = [...b, [wp.x]]
      A = [...A, [0, 0, 0, ip.x, ip.y, 1, -ip.x*wp.y, -ip.y*wp.y]]
      b = [...b, [wp.y]]
    }
    H = math.multiply(math.inv(math.matrix(A)), math.matrix(b))

    H.resize([9, 1])
    H.set([8, 0], 1)

    H = [[H.get([0, 0]), H.get([1, 0]), H.get([2, 0])], 
             [H.get([3, 0]), H.get([4, 0]), H.get([5, 0])],
             [H.get([6, 0]), H.get([7, 0]), H.get([8, 0])]]

    // H_inv = math.inv(H_inv)

    for (var i=0; i<this.img.width; i++) {
      for (var j=0; j<this.img.height; j++) {
        var loc = math.matrix([[i], [j], [1]]);
        var v = math.multiply(H, loc);

        var x = v.get([0, 0]) / v.get([2, 0]);
        var y = v.get([1, 0]) / v.get([2, 0]);

        this.distortedCanvasContext.putImageData(this.originImgCanvasContext.getImageData(i, j, 1, 1), math.round(x), math.round(y));
      }
    }
    

  }

  render() {
    const columns = [
      {
        title: 'Point Index',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'X',
        dataIndex: 'x',
        key: 'x',
      },
      {
        title: 'Y',
        dataIndex: 'y',
        key: 'y',
      }
    ];
    return (
      <div>
        <div style={{"marginTop": "20px"}}>
          <h1>Please upload the image:</h1>
          You can download the sample used in the book from here: <a href="https://www.robots.ox.ac.uk/~vgg/hzbook/hzbook2/WebPage/pngfiles/projgeomfigs-jen_no_meas.png">projgeomfigs-jen_no_meas</a>
          <br/>
          <input style={{"marginTop": "20px"}}
            type="file"
            name="myImage"
            onChange={this.handleChange}
          />
          <br/>

          {this.state.selectedImage && (
            <div style={{"marginTop": "20px"}}>
              <Button onClick={()=>this.clear()}>Clear Picture</Button>
              <Button style={{"marginLeft": "20px"}} onClick={()=>this.clearPoints()}>Clear Points</Button>
              { this.state.chosenPoints == 4 && this.state.worldCoordinates.length == 4 && <Button style={{"marginLeft": "20px"}} onClick={()=>this.remove_distortion()}>Remove Distortion</Button>}
            </div>
          )}
            <div style={{"marginTop": "20px", display: "flex", height: "300px"}}>
              <canvas 
                ref={this.zoomCanvasRef} width={200} height={200}/>
              {
                this.state.selectedImage && 
                (
                <div style={{display: "flex"}}>
                  <Table style={{marginLeft: 20}} pagination={false} dataSource={this.state.chosenPixels} columns={columns} />
                  <TextArea style={{marginLeft: 20}}
                    value={this.state.worldxy}
                    onChange={e => {
                        var points = []
                        e.target.value.split("\n").map(
                          (xy) => {
                            let point = xy.split(",");
                            if (point.length == 2) {
                              points = [...points, {x: Number(point[0]), y: Number(point[1])}]
                            }
                          }
                        )
                        this.setState({
                          worldxy: e.target.value,
                          worldCoordinates: points
                        })
                      }
                    }
                    placeholder="Input world plane coordinates"
                    autoSize={{ minRows: 4, maxRows: 6 }}
                  />
                </div>)
              }
            </div>

            <canvas onMouseMove={this.handleMouseMoveEvent} 
              onMouseLeave={this.handleMouseLeave}
              onClick={this.handleMouseClick}
              ref={this.originImgCanvasRef} 
              width={this.state.originImgCanvasWidth} 
              height={this.state.originImgCanvasHeight}/>

            <canvas
              ref={this.distortedCanvasRef} 
              width={this.state.originImgCanvasWidth * 2} 
              height={this.state.originImgCanvasHeight * 2}/>
        </div>
      </div>
    );
  
  }
}
