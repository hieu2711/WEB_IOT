import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardBody, CardHeader, CardTitle } from 'reactstrap';

const ChartColapse = ({ data, value1, value2, name, unit1, unit2, update }) => {
    const [zoomScale, setZoomScale] = useState(1);
    const gradientStroke = React.useMemo(() => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
        gradientStroke.addColorStop(1, 'rgba(29,140,248,0.2)');
        gradientStroke.addColorStop(0.4, 'rgba(29,140,248,0.0)');
        gradientStroke.addColorStop(0, 'rgba(29,140,248,0)'); //blue colors
        return gradientStroke;
    }, []);
    if (!data || data.length === 0) {
        return;
    }

    const Data1 = data.map((item) => parseInt(item[value1]));
    const Data2 = data.map((item) => parseInt(item[value2]));
    const chartData = {
        labels: ['', '', '', '', '', '', '', '', '', ''],
        datasets: [
            {
                label: unit2, // Label cho dữ liệu 1
                fill: true,
                backgroundColor: gradientStroke,
                borderColor: '#1f8ef1',
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: '#1f8ef1',
                pointBorderColor: 'rgba(255,255,255,0)',
                pointHoverBackgroundColor: '#1f8ef1',
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: Data1,
            },
            {
                label: unit1, // Label cho dữ liệu 2
                fill: true,
                borderColor: '#ff6384',
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: '#ff6384',
                pointBorderColor: 'rgba(255,255,255,0)',
                pointHoverBackgroundColor: '#ff6384',
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
                data: Data2, // Dữ liệu cho đường thứ hai
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        scales: {
            yAxes: [
                {
                    ticks: {
                        suggestedMin: Math.min(...data) - 10,
                        suggestedMax: Math.max(...data) + 10,
                    },
                },
            ],
        },
    };

    const handleZoomIn = () => {
        setZoomScale(zoomScale * 1.1);
    };

    const handleZoomOut = () => {
        setZoomScale(zoomScale * 0.9);
    };

    const handleResetZoom = () => {
        setZoomScale(1); // Đặt tỉ lệ zoom về 1
    };

    const handleMouseEnter = () => {
        // Khi hover vào biểu đồ, không cần làm gì cả
    };

    const handleMouseLeave = () => {
        // Khi rời khỏi biểu đồ, reset zoom về 1
        handleResetZoom();
    };

    const handleWheel = (event) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    return (
        <Card className="card-chart">
            <CardHeader>
                <div className="d-flex justify-content-between">
                    <h5 className="card-category">
                        {update === 'en'
                            ? `Update at ${data?.[data.length - 1]?.date}`
                            : `Cập nhật lúc ${data?.[data.length - 1]?.date}`}
                    </h5>
                    <div>
                        <span
                            style={{ fontSize: '1.3rem', cursor: 'pointer' }}
                            onClick={handleZoomIn}
                            className="material-icons"
                        >
                            zoom_in
                        </span>
                        <span
                            style={{ fontSize: '1.3rem', cursor: 'pointer' }}
                            onClick={handleZoomOut}
                            className="material-icons"
                        >
                            zoom_out
                        </span>
                        <span
                            style={{ fontSize: '1.3rem', cursor: 'pointer' }}
                            onClick={handleResetZoom}
                            className="material-icons"
                        >
                            zoom_out_map
                        </span>
                    </div>
                </div>
                <CardTitle tag="h3">
                    <i className="tim-icons icon-bell-55 text-info" /> {name}
                </CardTitle>
            </CardHeader>
            <CardBody style={{ minHeight: '250px' }}>
                <div
                    className="chart-area"
                    style={{ height: '100%', overflow: 'hidden' }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onWheel={handleWheel}
                >
                    <div
                        style={{
                            transform: `scale(${zoomScale})`,
                            transition: 'transform 0.1s ease-in-out',
                        }}
                    >
                        <Line
                            style={{ height: '220px' }}
                            data={chartData}
                            options={options}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default ChartColapse;
